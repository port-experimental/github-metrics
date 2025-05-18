import { Octokit } from '@octokit/rest';

interface DeveloperStats {
  login: string;
  joinDate: string | null;
  firstCommitDate: string | null;
  tenthCommitDate: string | null;
  firstPRDate: string | null;
  tenthPRDate: string | null;
  timeToFirstCommit: number | null;
  timeToFirstPR: number | null;
  timeTo10thCommit: number | null;
  timeTo10thPR: number | null;
  initialReviewResponseTime: number | null;
}

/**
 * We can look up the join date to the org where the customer is using Github Enterprise
 * 
 * @param enterprise 
 * @param authToken 
 */
export async function getMemberAddDates(
  enterprise: string,
  authToken: string
): Promise<any[]> {
  const octokit = new Octokit({ auth: authToken });

  const response = await octokit.request(`GET /enterprises/${enterprise}/audit-log`, {
    phrase: "action:org.add_member",
    include: "web",
    // enterprise: 'ENTERPRISE',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  return response.data.map((x: any) => ({ user: x.user, userId: x.user_id, createdAt: x.created_at }));;
}

export async function getRepositories(
  orgName: string,
  authToken: string
): Promise<any[]> {
  const octokit = new Octokit({ auth: authToken });

  const { data: repos } = await octokit.repos.listForOrg({
    org: orgName,
    per_page: 100,
  });

  return repos;
}

export async function getDeveloperStats(
  orgName: string,
  authToken: string,
  repos: any[],
  login: string,
  joinDate: string 
): Promise<DeveloperStats[]> {
  const octokit = new Octokit({ auth: authToken });
  const stats: DeveloperStats[] = [];

  try {
    console.log(`Getting stats for ${login}`);
    let firstCommitDate: string | null = null;
    let tenthCommitDate: string | null = null;
    let firstPRDate: string | null = null;
    let tenthPRDate: string | null = null;
    let allCommits: string[] = [];

    // Search for first commit
    for (const repo of repos) {
    try {
        const { data: commits } = await octokit.repos.listCommits({
        owner: orgName,
        repo: repo.name,
        author: login,
        per_page: 10,
        order: 'asc',
        });

        if (commits.length > 0) {
        commits.forEach(commit => {
            if (commit.commit.author?.date) {
            allCommits.push(commit.commit.author.date);
            }
        });
        }
    allCommits.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    if (allCommits.length > 0) {
        firstCommitDate = allCommits.length > 0 ? allCommits[0] : null;
        tenthCommitDate = allCommits.length > 9 ? allCommits[9] : null;
    }
    } catch (error) {
        console.warn(`Error fetching commits for ${repo.name}: ${error}`);
    }

      // Search for first PR
      try {
        // Use more specific search query and add state to filter only merged PRs
        const { data: pulls } = await octokit.search.issuesAndPullRequests({
          q: `author:${login} type:pr org:${orgName} is:merged`,
          sort: 'created',
          order: 'asc',
          per_page: 10,
          headers: {
            'If-None-Match': '', // Bypass cache to avoid stale results
            'Accept': 'application/vnd.github.v3+json' // Specify API version
          }
        });

        firstPRDate = pulls.items.length > 0 ? pulls.items[0].created_at : null;
        tenthPRDate = pulls.items.length > 9 ? pulls.items[9].created_at : null;
      } catch (error) {
        console.warn(`Error fetching PRs for ${login}: ${error}`);
      }

      stats.push({
        login: login,
        joinDate,
        firstCommitDate,
        tenthCommitDate,
        firstPRDate,
        tenthPRDate,
        // Times in hours
        timeToFirstCommit: firstCommitDate ? (new Date(firstCommitDate).getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60) : null,
        timeToFirstPR: firstPRDate ? (new Date(firstPRDate).getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60) : null,
        timeTo10thCommit: tenthCommitDate ? (new Date(tenthCommitDate).getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60) : null,
        timeTo10thPR: tenthPRDate ? (new Date(tenthPRDate).getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60) : null,
        initialReviewResponseTime: null,
      });
    }

    return stats;
  } catch (error) {
    throw new Error(`Failed to fetch developer stats for ${login}: ${error}`);
  }
}

export function hasCompleteOnboardingMetrics(user: any) {
  return user.properties.first_commit && user.properties.tenth_commit && user.properties.first_pr && user.properties.tenth_pr
    && user.properties.time_to_first_commit && user.properties.time_to_first_pr && user.properties.time_to_10th_commit && user.properties.time_to_10th_pr
    && user.properties.initial_review_response_time;
}
