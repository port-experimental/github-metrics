# Github Metrics

This is a metric exporter for Github. It uses an auth token to pull data from the API and prepare a series of metrics, which are persisted in Port.


## Metrics

The metrics currently supported are:

- For each member of each listed Github Org:
  - Join Date
  - Date of and time to 1st Commit
  - Date of and time to 10th Commit
  - Date of and time to 1st PR
  - Date of and time to 10th PR
  - Date of and time to first PR review
- For each PR:
  - PR size
  - PR lifetime
  - PR pickup time
  - Review participation
- For each Action:
  - For both last 30 and last 90 days:
    - Median, Min, Max and Mean Duration
    - Total runs
    - Total failures
    - Success rate

## Configuration

### Configuring the PAT

The metric exporter needs access to the Github API to pull the relevant data to calculate the above metrics. Please configure a classic PAT with the following access:

- `repo`
- `workflow`
- `read:org`
- `read:user`
- `user:email`
- `read:enterprise` - this is required along with the below to access the audit log to determine join dates
- `read:audit_log`

### Running Locally

1. Copy the example env file and fill out with the relevant access keys
```
cp .env.example .env
```

2. Install the CLI
```
npm install
npm run build
npm link
```

3. Run!
```
gh-metrics onboarding-metrics
gh-metrics pr-metrics
gh-metrics workflow-metrics
```

### Running as a Github Action 

If you want to run this metric exporter as a Github Action, feel free to use this action configuration. This will run the metric collectors on a daily basis

##### .github/workflows/collect_metrics.yml
```
name: collect_metrics
on:
    workflow_dispatch:
    schedule:
      - cron: '0 0 * * *'
jobs:
    onboarding:
      name: onboarding_metrics
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun run src/main.ts onboarding-metrics
          env: # Or as an environment variable
            X_GITHUB_ORGS: ${{ secrets.X_GITHUB_ORGS }}
            X_GITHUB_ENTERPRISE: ${{ secrets.X_GITHUB_ENTERPRISE }}
            X_GITHUB_TOKEN: ${{ secrets.X_GITHUB_TOKEN }}
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
    pr:
      name: pr_metrics
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun run src/main.ts pr-metrics
          env: # Or as an environment variable
            X_GITHUB_ORGS: ${{ secrets.X_GITHUB_ORGS }}
            X_GITHUB_ENTERPRISE: ${{ secrets.X_GITHUB_ENTERPRISE }}
            X_GITHUB_TOKEN: ${{ secrets.X_GITHUB_TOKEN }}
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
    workflow:
      name: workflow_metrics
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun run src/main.ts workflow-metrics
          env: # Or as an environment variable
            X_GITHUB_ORGS: ${{ secrets.X_GITHUB_ORGS }}
            X_GITHUB_ENTERPRISE: ${{ secrets.X_GITHUB_ENTERPRISE }}
            X_GITHUB_TOKEN: ${{ secrets.X_GITHUB_TOKEN }}
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}  
```

##### .github/workflows/pr_metrics
```
name: pr_metrics
on:
    workflow_dispatch:
    schedule:
      - cron: '0 0 * * *'
jobs:
    my-job:
      name: pr_metrics
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun run src/main.ts pr-metrics
          env: # Or as an environment variable
            X_GITHUB_ORGS: ${{ secrets.X_GITHUB_ORGS }}
            X_GITHUB_ENTERPRISE: ${{ secrets.X_GITHUB_ENTERPRISE }}
            X_GITHUB_TOKEN: ${{ secrets.X_GITHUB_TOKEN }}
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
```





## Blueprints

Please create a blueprint with the following configuration

```
{
  "identifier": "githubWorkflow",
  "title": "Workflow",
  "icon": "Github",
  "schema": {
    "properties": {
      "path": {
        "title": "Path",
        "type": "string"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "active",
          "deleted",
          "disabled_fork",
          "disabled_inactivity",
          "disabled_manually"
        ],
        "enumColors": {
          "active": "green",
          "deleted": "red"
        }
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "deletedAt": {
        "title": "Deleted At",
        "type": "string",
        "format": "date-time"
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      },
      "medianDuration_last_30_days": {
        "title": "Median Duration Last 30 days",
        "description": "Median Duration of Successful runs in the last 30 days",
        "type": "number"
      },
      "maxDuration_last_30_days": {
        "title": "Max Duration Last 30 days",
        "description": "Max Duration of Successful runs in the last 30 days",
        "type": "number"
      },
      "minDuration_last_30_days": {
        "title": "Min Duration Last 30 days",
        "description": "Min Duration of Successful runs in the last 30 days",
        "type": "number"
      },
      "meanDuration_last_30_days": {
        "title": "Mean Duration Last 30 days",
        "description": "Mean Duration of Successful runs in the last 30 days",
        "type": "number"
      },
      "totalRuns_last_30_days": {
        "title": "Total Runs Last 30 days",
        "description": "Total workflow runs in the last 30 days",
        "type": "number"
      },
      "totalFailures_last_30_days": {
        "title": "Total Failures Last 30 days",
        "description": "Total Workflow Run Failures in the last 30 days",
        "type": "number"
      },
      "successRate_last_30_days": {
        "title": "Success Rate Last 30 days",
        "description": "Success Rate for the workflow in the last 30 days",
        "type": "number"
      },
      "medianDuration_last_90_days": {
        "title": "Median Duration Last 90 days",
        "description": "Median Duration of Successful runs in the last 90 days",
        "type": "number"
      },
      "maxDuration_last_90_days": {
        "title": "Max Duration Last 90 days",
        "description": "Max Duration of Successful runs in the last 90 days",
        "type": "number"
      },
      "minDuration_last_90_days": {
        "title": "Min Duration Last 90 days",
        "description": "Min Duration of Successful runs in the last 90 days",
        "type": "number"
      },
      "meanDuration_last_90_days": {
        "title": "Mean Duration Last 90 days",
        "description": "Mean Duration of Successful runs in the last 90 days",
        "type": "number"
      },
      "totalRuns_last_90_days": {
        "title": "Total Runs Last 90 days",
        "description": "Total workflow runs in the last 90 days",
        "type": "number"
      },
      "totalFailures_last_90_days": {
        "title": "Total Failures Last 90 days",
        "description": "Total Workflow Run Failures in the last 90 days",
        "type": "number"
      },
      "successRate_last_90_days": {
        "title": "Success Rate Last 90 days",
        "description": "Success Rate for the workflow in the last 90 days",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "repository": {
      "title": "Repository",
      "target": "repository",
      "required": false,
      "many": false
    }
  }
}
```