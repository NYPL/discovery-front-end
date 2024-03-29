## Deployment

### Tools

Install:

- AWS CLI
- EB CLI

### Repo Branches

We use three branches for deployment: `development`, `qa`, `master`.

- `development`: This branch is the target of all PRs and thus contains all approved features. Automatically deployed to `discovery-ui-develpoment` (dev-discovery.nypl.org)
- `qa`: Automatically deployed to `discovery-ui-qa` (qa-discovery.nypl.org)
- `master`: Our "production" branch. Automatically deployed to `discovery-ui-production` (discovery.nypl.org)

If we have a new feature to add, the suggested workflow is:

- Create branch for new feature `git checkout -b new-feature` off the `development` branch.
- Create Pull Request pointing to the `development` branch.
- To test the branch on the development server, follow the instructions below for deploying to Development
- Once the Pull Request is accepted merge it into `development`
- Update version in `development` branch:
  - Decide on appropriate new version number
  - Add notes to CHANGELOG.md & update `package.json` version number. Commit.
  - `git push origin development`
- Eventually merge `development` into `qa`
- Eventually merge `qa` into `master`
- Add git tag to `master` (e.g. `git tag -a v1.4.3; git push --tags`)

### Versioning

Once a feature branch has been approved and merged into development

### Elastic Beanstalk

There are two existing AWS accounts that we are deploying to for development and for qa/production.

Make sure you have the AWS CLI tool installed on your machine and make sure you have the correct credentials for the two accounts. Since we have two accounts, nypl-sandbox and nypl-digital-dev, make sure you create two profiles using the AWS CLI tool:

    aws configure --profile nypl-digital-dev

Pass in the correct credentials and now we can start deploying.

### Configuration

Run `eb init` at the root of this repo with the following settings:

- Select region 'us-east-1'
- Select application 'discovery-ui'
- Select default environment 'discovery-ui-development'
- If asked about CodeCommit, select 'n'
- If asked if you want to set up SSH for your instances, select 'n'
- Now manually edit `.elasticbeanstalk/config.yml` to include the following `branch-defaults`:

```
branch-defaults:
  dev-eb-deploy:
    environment: discovery-ui-development
    group_suffix: null
  master:
    environment: discovery-ui-production
    group_suffix: null
  qa:
    environment: discovery-ui-qa
    group_suffix: null
```

Note that `development` will always differ from `qa` in one respect: Apps deployed to `nypl-sandbox` require a different cert ARN than that for `nypl-digital-dev`. Accordingly, `development` will always have a slightly different `.ebextensions/01_loadbalancer-terminatehttps.config` from that of `qa`. Due to the order in which those differences were originally committed, merging `development` into `qa` should never disrupt that.

### Deployment

|                  | Development              | QA               | Production              |
| ---------------- | ------------------------ | ---------------- | ----------------------- |
| Git branch       | development              | qa               | master                  |
| AWS Profile      | nypl-sandbox             | nypl-digital-dev | nypl-digital-dev        |
| Application Name | discovery-ui             | discovery-ui     | discovery-ui            |
| Environment Name | discovery-ui-development | discovery-ui-qa  | discovery-ui-production |

---

Deploy to the development server:

_(Note that updates to origin/development trigger a deploy to discovery-ui-development. The following demonstrates manually deploying development - or a feature branch - to discovery-ui-development should you need to.)_

- Check out `development` branch (or feature branch if deploying a feature to dev before merge)
- Run `npm run deploy-development`

---

Deploy to the qa server:

_(Note that updates to origin/qa trigger a deploy to discovery-ui-qa. The following demonstrates manually deploying qa should you need to.)_

- `git checkout qa`, `git merge development`, `git push origin qa`
- Run `npm run deploy-qa`

---

Deploy to the production server:

_(Note that updates to origin/master trigger a deploy to discovery-ui-production. The following demonstrates manually deploying production should you need to.)_

- `git checkout master`, `git merge qa`, `git push origin master`
- Run `npm run deploy-production`

### Troubleshooting

#### Python error: "ERROR: TypeError :: cannot concatenate 'str' and 'NoneType' objects"

This may indicate your `.elasticbeanstalk/config.yml` is missing a value or two. Try running `eb init` to fill in missing values. See "Configuration" section above for best defaults.
