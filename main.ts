import { Command } from 'commander';
import { Octokit } from '@octokit/rest';

import { getEntities, upsertEntity, upsertProps } from './src/port_client';
import { getDeveloperStats, getMemberAddDates, hasCompleteOnboardingMetrics, getRepositories } from './src/onboarding_metrics';
import { checkRateLimits } from './src/utils';
import { getPRMetrics } from './src/pr_metrics';
import { getWorkflowMetrics } from './src/workflow_metrics';

if (process.env.GITHUB_ACTIONS !== 'true') {
  require('dotenv').config();
}

async function main() {
  const PORT_CLIENT_ID = process.env.PORT_CLIENT_ID;
  const PORT_CLIENT_SECRET = process.env.PORT_CLIENT_SECRET;
  const AUTH_TOKEN = process.env.X_GITHUB_TOKEN;
  const ENTERPRISE_NAME = process.env.X_GITHUB_ENTERPRISE;
  const GITHUB_ORGS = process.env.X_GITHUB_ORGS?.split(',') || [];
  
  if (!PORT_CLIENT_ID || !PORT_CLIENT_SECRET || !AUTH_TOKEN || !ENTERPRISE_NAME || GITHUB_ORGS.length === 0) {
    console.log('Please provide env vars PORT_CLIENT_ID, PORT_CLIENT_SECRET, X_GITHUB_TOKEN, X_GITHUB_ENTERPRISE, and X_GITHUB_ORGS');
    process.exit(0);
  }
  
  
  try {
    const program = new Command();
    
    program
    .name('github-sync')
    .description('CLI to pull metrics from GitHub to Port');
    
    program
    .command('onboarding-metrics')
    .description('Send onboarding metrics to Port')
    .action(async () => {
      console.log('Calculating onboarding metrics...');
      await checkRateLimits(AUTH_TOKEN);
      const githubUsers = await getEntities('githubUser');
      console.log(githubUsers);
      
      const joinRecords = await getMemberAddDates(ENTERPRISE_NAME, AUTH_TOKEN);
      console.log(joinRecords);
      
      const repos = await getRepositories(GITHUB_ORGS, AUTH_TOKEN);
      console.log(`Got ${repos.length} repos`);
      
      // Only go over users without complete onboarding metrics in Port
      const usersWithoutOnboardingMetrics = githubUsers.entities.filter(user => !hasCompleteOnboardingMetrics(user));
      console.log(`Found ${usersWithoutOnboardingMetrics.length} users without complete onboarding metrics`);
      
      // For each user, get the onboarding metrics
      for (const user of usersWithoutOnboardingMetrics) {
        const joinDate = joinRecords.find(record => record.user === user.identifier)?.createdAt;
        if (!joinDate) {
          console.log(`No join date found for ${user.identifier}. Skipping...`);
          continue;
        }
        console.log(`Getting stats for ${user.identifier} with join date ${joinDate}`);
        const stats = await getDeveloperStats(GITHUB_ORGS, AUTH_TOKEN, user.identifier, joinDate);
        const { firstCommitDate, tenthCommitDate, firstPRDate, tenthPRDate, initialReviewResponseTime, timeToFirstCommit, timeToFirstPR, timeTo10thCommit, timeTo10thPR } = stats.find(record => record.login === user.identifier) || {};
        
        const props: Record<string, any> = {};
        if (!firstCommitDate && !firstPRDate && !tenthCommitDate && !tenthPRDate) {
          continue;
        }
        
        if (firstCommitDate) {
          props['first_commit'] = new Date(firstCommitDate);
        }
        
        if (tenthCommitDate) {
          props['tenth_commit'] = new Date(tenthCommitDate);
        }
        
        if (firstPRDate) {
          props['first_pr'] = new Date(firstPRDate);
        }
        
        if (tenthPRDate) {
          props['tenth_pr'] = new Date(tenthPRDate);
        }
        
        if (initialReviewResponseTime) {
          props['initial_review_response_time'] = initialReviewResponseTime;
        }
        
        if (timeToFirstCommit) {
          props['time_to_first_commit'] = timeToFirstCommit;
        }
        
        if (timeToFirstPR) {
          props['time_to_first_pr'] = timeToFirstPR;
        }
        
        if (timeTo10thCommit) {
          props['time_to_10th_commit'] = timeTo10thCommit;
        }
        
        if (timeTo10thPR) {
          props['time_to_10th_pr'] = timeTo10thPR;
        }
        
        try {
          console.log(`attempting to update ${user.identifier}`);
          await upsertEntity(
            'githubUser',
            user.identifier,
            user.title,
            {
              ...user.properties,
              ...props
            },
            user.relations
          );
          console.log(`Updated first commit and PR dates for user ${user.identifier}`);
        } catch (error) {
          console.error(`Failed to update user ${user.identifier}:`, error);
        }
      }
    });
    
    program
    .command('pr-metrics')
    .description('Send PR metrics to Port')
    .action(async () => {
      console.log('Calculating PR metrics...');
      await checkRateLimits(AUTH_TOKEN);
      const repos = await getRepositories(GITHUB_ORGS, AUTH_TOKEN);
      console.log(`Got ${repos.length} repos`);
      
      const prMetrics = await getPRMetrics(repos, AUTH_TOKEN);
      console.log(prMetrics);
      
      for (const record of prMetrics) {
        const { prSize, prLifetime, prPickupTime, prSuccessRate, reviewParticipation } = record;
        
        const props: Record<string, any> = {};
        props['pr_size'] = prSize;
        props['pr_lifetime'] = prLifetime;
        props['pr_pickup_time'] = prPickupTime;
        props['pr_success_rate'] = prSuccessRate;
        props['review_participation'] = reviewParticipation;
        
        try {
          console.log(`attempting to update ${record.repoName}-${record.pullRequestId}`);
          await upsertProps(
            'githubPullRequest',
            `${record.repoName}-${record.pullRequestId}`,
            {
              ...props
            },
          );
          console.log(`Updated PR metrics for repo ${record.repoName}-${record.pullRequestId}`);
        } catch (error) {
          console.error(`Failed to update repo ${record.repoName}-${record.pullRequestId}:`, error);
        }
      }
    });
    
    program
    .command('workflow-metrics')
    .description('Send GitHub Workflow metrics to Port')
    .action(async () => {
      console.log('Calculating Workflows metrics...');
      await checkRateLimits(AUTH_TOKEN);
      const repos = await getRepositories(GITHUB_ORGS, AUTH_TOKEN);
      await getWorkflowMetrics(repos, AUTH_TOKEN);
    });
    
    await program.parseAsync();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();