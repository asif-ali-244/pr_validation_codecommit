# Automated Code Review with Pull requests in AWS Code Commit

Pull request validation is a part of CI pipeline that will be run whenever the PR is submitted. As a best practice, it is recommended that we run validation tests before merging the PR to the branch. A pull request validation step can run unit tests, build, code coverage etc. This will ensure that the PRs do not break the build or introduce any other issue. If the PR validation passes, then the changes are ready to be safely merged into the main branch.

Code Commit natively doesn’t support running validation tests on creation of a pull request, we can however trigger a lambda function that can run a code build project that will behave as our validation build. The pull request status can then be updated according to the validation build, we can approve and safely merge the PR if the build passed.

## Install

Typescript/JavaScript:

```bash
npm i pr_validation_codecommit
```

## How to Use

```typescript
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as pr from 'pr_validation_codecommit'

export class PullRequestValidationStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id)

        // build spec for validating angular app
        const angularValidationBuildSpec = {
            version: 0.2,
            env: {
                shell: "bash"
            },
            phases: {
                install: {
                    "runtime-versions": {
                        nodejs: 14
                    },
                    commands: [
                        "npm install",
                        "npm install -g @angular/cli"
                    ]
                },
                pre_build: {
                    commands: [
                        "node -v && npm -v"
                    ]
                },
                build: {
                    commands: [
                        "npm run build",
                        "npm run coverage"
                    ]
                }
            }
        }

        new pr.CodeCommitPrValidation(this, 'pr-validation',{
            config: [
                {
                    repoName: 'angular-app-repo',
                    projectConfig: {
                        buildSpec: BuildSpec.fromObject(angularValidationBuildSpec)
                    }
                }
            ]
        })
    }
}
```

Now when you create a PR it will trigger a codebuild project that would validate your PR. If the validation build passes, the PR will be approved and can be merged using the merge option on the PR. You can also watch the status of the validation build in the **`Activity`** tab of the PR.

## API Reference

See [API.md](https://github.com/asif-ali-244/pr_validation_codecommit/blob/main/API.md)
