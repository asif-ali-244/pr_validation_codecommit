import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Project } from 'aws-cdk-lib/aws-codebuild';
import { IRepository } from 'aws-cdk-lib/aws-codecommit';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface ApprovePRLambdaFunctionProps {

  readonly projectMap: Map<IRepository, Project>;

  /**
     * The function execution time (in seconds) after which Lambda terminates
     * the function.
     *
     * @default Duration.minutes(15)
     */
  readonly timeout?: Duration;

}
export class ApprovePRLambdaFunction extends Construct {
  private _function: Function;
  public get approvePrLambda() {
    return this._function;
  }
  constructor(scope: Construct, id:string, props:ApprovePRLambdaFunctionProps) {
    super(scope, id);

    this._function = new Function(this, 'handler', {
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'approve_pr_lambda')),
      functionName: 'approve-pr-lambda',
      handler: 'index.handler',
      runtime: Runtime.NODEJS_16_X,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: props.timeout ?? Duration.minutes(15),
    });

    this._function.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'codecommit:PostCommentForPullRequest',
          'codecommit:UpdatePullRequestApprovalState',
        ],
        resources: Array.from(props.projectMap.keys()).map((repository) => repository.repositoryArn),
      }),
    );

  }
}