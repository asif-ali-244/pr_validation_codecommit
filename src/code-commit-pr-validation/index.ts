import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Project, ProjectProps, Source } from 'aws-cdk-lib/aws-codebuild';
import { IRepository, Repository } from 'aws-cdk-lib/aws-codecommit';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

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


    // repo name and project build name mapping: push to ssm parameter

    let projectMapParameter: { [key: string]: string } = {};
    this.projectMap.forEach((value, key) => projectMapParameter[key.repositoryName] = value.projectName);
    const ssmParameter = new StringParameter(this, 'ProjectMap', {
      description: 'pr validation repo=>project map',
      parameterName: '/prValidation/projectMap',
      stringValue: JSON.stringify(projectMapParameter),
    });

    const approvePrLambda = new Function(this, 'approve-pr-lambda', {
      code: Code.fromAsset(path.join(__dirname, 'lambdas/approve_pr_lambda')),
      functionName: 'approve-pr-lambda',
      handler: 'index.handler',
      runtime: Runtime.PYTHON_3_9,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(2),
    });

    approvePrLambda.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'codecommit:PostCommentForPullRequest',
          'codecommit:UpdatePullRequestApprovalState',
        ],
        resources: Array.from(this.projectMap.keys()).map((repository) => repository.repositoryArn),
      }),
    );

    const buildTriggerLambda = new Function(this, 'trigger-build-lambda', {
      code: Code.fromAsset(path.join(__dirname, 'lambdas/trigger_build_lambda')),
      functionName: 'trigger-build-lambda',
      environment: {
        BUILD_MAP_PARAMETER_NAME: ssmParameter.parameterName,
        APPROVER: `${approvePrLambda.role?.roleName}/${approvePrLambda.functionName}`,
      },
      handler: 'index.handler',
      runtime: Runtime.PYTHON_3_9,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: Duration.minutes(2),
    });

    buildTriggerLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['codebuild:StartBuild'],
        resources: Array.from(this.projectMap.values()).map((project) => project.projectArn),
      }));

    buildTriggerLambda.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'codecommit:PostCommentForPullRequest',
          'codecommit:CreatePullRequestApprovalRule',
        ],
        resources: Array.from(this.projectMap.keys()).map((repository) => repository.repositoryArn),
      }),
    );

    buildTriggerLambda.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'ssm:GetParameter',
        ],
        resources: [
          ssmParameter.parameterArn,
        ],
      }),
    );

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