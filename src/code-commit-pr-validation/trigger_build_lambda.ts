import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Project } from 'aws-cdk-lib/aws-codebuild';
import { IRepository } from 'aws-cdk-lib/aws-codecommit';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface TriggerBuildLambdaFunctionProps {

  readonly projectMap: Map<IRepository, Project>;

  /**
     * The function execution time (in seconds) after which Lambda terminates
     * the function.
     *
     * @default Duration.minutes(15)
     */
  readonly timeout?: Duration;
  /**
     * approve Pr lambda
     */
  readonly approvePrLambda: Function;

}
export class TriggerBuildLambdaFunction extends Construct {
  private _function: Function;
  public get buildTriggerLambda() {
    return this._function;
  }
  constructor(scope: Construct, id: string, props: TriggerBuildLambdaFunctionProps) {
    super(scope, id);

    // repo name and project build name mapping: push to ssm parameter

    let projectMapParameter: { [key: string]: string } = {};
    props.projectMap.forEach((value, key) => projectMapParameter[key.repositoryName] = value.projectName);
    const ssmParameter = new StringParameter(this, 'ProjectMap', {
      description: 'pr validation repo=>project map',
      parameterName: '/prValidation/projectMap',
      stringValue: JSON.stringify(projectMapParameter),
    });

    this._function = new Function(this, 'handler', {
      code: Code.fromAsset(path.join(__dirname, 'lambdas', 'trigger_build_lambda')),
      functionName: 'trigger-build-lambda',
      environment: {
        BUILD_MAP_PARAMETER_NAME: ssmParameter.parameterName,
        APPROVER: `${props.approvePrLambda.role?.roleName}/${props.approvePrLambda.functionName}`,
      },
      handler: 'index.handler',
      runtime: Runtime.NODEJS_18_X,
      logRetention: RetentionDays.ONE_WEEK,
      timeout: props.timeout ?? Duration.minutes(15),
    });

    this._function.addToRolePolicy(
      new PolicyStatement({
        actions: ['codebuild:StartBuild'],
        resources: Array.from(props.projectMap.values()).map((project) => project.projectArn),
      }));

    this._function.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'codecommit:PostCommentForPullRequest',
          'codecommit:CreatePullRequestApprovalRule',
        ],
        resources: Array.from(props.projectMap.keys()).map((repository) => repository.repositoryArn),
      }),
    );

    this._function.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'ssm:GetParameter',
        ],
        resources: [
          ssmParameter.parameterArn,
        ],
      }),
    );

  }
}