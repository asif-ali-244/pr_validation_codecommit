import { EventBridgeEvent } from 'aws-lambda';
import { CodeBuild, CodeCommit, SSM } from 'aws-sdk';

interface TriggerCodeBuildParameters {
  sourceCommit: string;
  destinationCommit: string;
  sourceBranch: string;
  pullRequestId: string;
  repositoryName: string;
  revisionId: string;
  codeBuildName: string;
}

interface PostPRCommentParameters {
  codeBuildId: string;
  sourceCommit: string;
  destinationCommit: string;
  pullRequestId: string;
  repositoryName: string;
  codeBuildName: string;
  region: string;
}

const codeCommit = new CodeCommit();
const codeBuild = new CodeBuild();

const getParameter = async (paramName: string): Promise<string> => {
  const ssm = new SSM();
  const params = {
    Name: paramName,
  };
  const data = await ssm.getParameter(params).promise();
  return data.Parameter?.Value!;
};

const getBuildName = async (repoName: string): Promise<string> => {
  const BUILD_MAP = process.env.BUILD_MAP_PARAMETER_NAME!;
  const buildMapParam = await getParameter(BUILD_MAP);
  const buildMap = JSON.parse(buildMapParam);
  return buildMap[repoName];
};

const triggerCodeBuild = async (params: TriggerCodeBuildParameters): Promise<string> => {
  console.log(params);
  try {
    console.log('triggering code build pr project');
    const input = {
      projectName: params.codeBuildName,
      sourceVersion: params.sourceCommit,
      environmentVariablesOverride: [
        {
          name: 'pullRequestId',
          value: params.pullRequestId,
          type: 'PLAINTEXT',
        },
        {
          name: 'sourceCommit',
          value: params.sourceCommit,
          type: 'PLAINTEXT',
        },
        {
          name: 'destinationCommit',
          value: params.destinationCommit,
          type: 'PLAINTEXT',
        },
        {
          name: 'repositoryName',
          value: params.repositoryName,
          type: 'PLAINTEXT',
        },
        {
          name: 'revisionId',
          value: params.revisionId,
          type: 'PLAINTEXT',
        },
      ],
    };
    const build = await codeBuild.startBuild(input).promise();
    return build.build?.id!;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const postBuildStartedCommentOnPR = async (params: PostPRCommentParameters) => {
  const logLink = `https://${params.region}.console.aws.amazon.com/codesuite/codebuild/projects/${params.codeBuildName}/build/${params.codeBuildId}`;

  try {
    const input: CodeCommit.Types.PostCommentForPullRequestInput = {
      pullRequestId: params.pullRequestId,
      repositoryName: params.repositoryName,
      beforeCommitId: params.sourceCommit,
      afterCommitId: params.destinationCommit,
      content: `Build for Validating Pull Request has been started. Check [CodeBuild Logs](${logLink})`,
    };
    await codeCommit.postCommentForPullRequest(input).promise();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const addApproverToPr = async (pullRequestId: string, accountId: string): Promise<void> => {

  const APPROVER = process.env.APPROVER;

  const approval_rule_content = {
    Version: '2018-11-08',
    Statements: [
      {
        Type: 'Approvers',
        NumberOfApprovalsNeeded: 1,
        ApprovalPoolMembers: [
          `arn:aws:sts::${accountId}:assumed-role/${APPROVER}`,
        ],
      },
    ],
  };

  try {
    const params: any = {
      approvalRuleContent: JSON.stringify(approval_rule_content),
      approvalRuleName: 'pr-approval',
      pullRequestId,
    };
    await codeCommit.createPullRequestApprovalRule(params).promise();
  } catch (error) {
    if (error.code === 'ApprovalRuleNameAlreadyExistsException') {
      console.log('Rule Already Exist');
    } else {
      console.error(error);
      throw error;
    }
  }
};

export const handler = async (event: EventBridgeEvent<string, any>): Promise<void> => {
  console.log(event);
  try {
    const destinationCommit: string = event.detail.destinationCommit;
    const sourceCommit: string = event.detail.sourceCommit;
    const sourceReference: string = event.detail.sourceReference;
    const tempArray: string[] = sourceReference.split('/');
    const sourceBranch: string = sourceReference[tempArray.length - 1];
    const pullRequestId: string = event.detail.pullRequestId;
    const revisionId: string = event.detail.revisionId;
    const repositoryName: string = event.detail.repositoryNames[0];
    const region: string = event.region;
    const accountId: string = event.account;

    const codeBuildName = await getBuildName(repositoryName);

    const codeBuildParameters = {
      sourceCommit,
      destinationCommit,
      sourceBranch,
      pullRequestId,
      repositoryName,
      revisionId,
      codeBuildName,
    };

    console.log(codeBuildParameters);

    // Trigger codebuild

    const codeBuildId = await triggerCodeBuild(codeBuildParameters);

    // Post comment on PR

    const postCommentOnPRParameters = {
      codeBuildId,
      sourceCommit,
      destinationCommit,
      pullRequestId,
      repositoryName,
      codeBuildName,
      region,
    };

    await postBuildStartedCommentOnPR(postCommentOnPRParameters);

    // Add approval rule to PR

    await addApproverToPr(pullRequestId, accountId);


  } catch (err) {
    console.error(err);
    throw err;
  }
};
