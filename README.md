# Github Metrics


## Blueprints

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