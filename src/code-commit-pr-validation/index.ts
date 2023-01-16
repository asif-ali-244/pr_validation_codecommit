import * as path from 'path';
import { Project, ProjectProps, Source } from 'aws-cdk-lib/aws-codebuild';
import { IRepository, Repository } from 'aws-cdk-lib/aws-codecommit';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { ApprovePRLambdaFunction } from './approve_pr_lambda';
import { TriggerBuildLambdaFunction } from './trigger_build_lambda';


export const approvePrLambdaDir = path.join(__dirname, 'lambdas', 'approve_pr_lambda');

export const triggerBuildLambdaDir = path.join(__dirname, 'lambdas', 'trigger_build_lambda');

export interface ConfigProps {
  /**
   * Repository Name
   */
  readonly repoName: string;
  /**
   * Code Build configuration for PR validation
   */
  readonly projectConfig?: ProjectProps;
}

export interface CodeCommitPrValidationProps {
  readonly config: ConfigProps[];
}

export class CodeCommitPrValidation extends Construct {
  private projectMap: Map<IRepository, Project>;
  constructor(scope: Construct, id: string, props: CodeCommitPrValidationProps) {
    super(scope, id);

    this.projectMap = new Map<IRepository, Project>();
    props.config.forEach((element) => {
      const repo = Repository.fromRepositoryName(this, `${element.repoName}`, element.repoName);
      const project = new Project(this, `${element.repoName}-validation-project`, {
        ...element.projectConfig,
        source: Source.codeCommit({ repository: repo }),
        projectName: `${element.repoName}-pr-validation-project`,
        description: `PR validation build for ${element.repoName}`,
      });
      this.projectMap.set(repo, project);
    });

    const { approvePrLambda } = new ApprovePRLambdaFunction(this, 'approve-pr-lambda', {
      projectMap: this.projectMap,
    });

    const { buildTriggerLambda } = new TriggerBuildLambdaFunction(this, 'trigger-build-lambda', {
      projectMap: this.projectMap,
      approvePrLambda,
    });

    // event rules
    const pr_rule = new Rule(this, 'pr-event-rule', {
      description: 'A rule to trigger on pull requests creation/update for pr validation',
      eventPattern: {
        detailType: ['CodeCommit Pull Request State Change'],
        resources: Array.from(this.projectMap.keys()).map((repository) => repository.repositoryArn),
        source: ['aws.codecommit'],
        detail: {
          event: ['pullRequestCreated', 'pullRequestSourceBranchUpdated'],
        },
      },
    });
    pr_rule.addTarget(new LambdaFunction(buildTriggerLambda));

    const pr_build_rule = new Rule(this, 'pr-build-rule', {
      description: 'A rule that responds to codebuild status for pr valiation',
      eventPattern: {
        detailType: ['CodeBuild Build State Change'],
        source: ['aws.codebuild'],
        detail: {
          'project-name': Array.from(this.projectMap.values()).map((project) => project.projectName),
          'build-status': [
            'FAILED',
            'SUCCEEDED',
          ],
        },
      },
    });
    pr_build_rule.addTarget(new LambdaFunction(approvePrLambda));

  }
}