import { CodeBuildStateEventDetail, EventBridgeEvent } from 'aws-lambda';
import { CodeCommit } from 'aws-sdk';

const codeCommit = new CodeCommit();

const getContent = (buildStatus: string, buildId: string, buildName: string, region: string): string => {
  const id_temp = buildId.split('/');
  const id = id_temp[id_temp.length - 1];
  const logLink = `https://${region}.console.aws.amazon.com/codesuite/codebuild/projects/${buildName}/build/${id}`;

  if (buildStatus === 'SUCCEEDED') {
    return `### &#9989 BUILD SUCCEEDED. Check [Logs](${logLink})`;
  } else {
    return `### &#10060 BUILD FAILED. Check [Logs](${logLink})`;
  }
};

const approvePR = async (buildStatus: string, revisionId: string, pullRequestId: string) => {

  if (buildStatus === 'SUCCEEDED') {
    try {
      const params = {
        pullRequestId,
        revisionId,
        approvalState: 'APPROVE',
      };
      await codeCommit.updatePullRequestApprovalState(params).promise();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

const commentCodeBuildResultOnPR = async (params: CodeCommit.Types.PostCommentForPullRequestInput): Promise<void> => {
  try {
    await codeCommit.postCommentForPullRequest(params).promise();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const handler = async (event: EventBridgeEvent<string, CodeBuildStateEventDetail>): Promise<void> => {
  console.log(event);
  try {
    const buildId = event.detail['build-id'];
    const buildName = event.detail['project-name'];
    const buildStatus = event.detail['build-status'];
    const region = event.region;
    const environmentVariableList = event.detail['additional-information'].environment['environment-variables'];

    let pullRequestId: string = '';
    let beforeCommitId: string = '';
    let afterCommitId: string = '';
    let repositoryName: string = '';
    let revisionId: string = '';

    environmentVariableList.forEach((element) => {
      switch (element.name) {
        case 'pullRequestId':
          pullRequestId = element.value;
          break;
        case 'sourceCommit':
          beforeCommitId = element.value;
          break;
        case 'destinationCommit':
          afterCommitId = element.value;
          break;
        case 'repositoryName':
          repositoryName = element.value;
          break;
        case 'revisionId':
          revisionId = element.value;
          break;
      }
    });

    // get content to put on PR activity tab

    const content = getContent(buildStatus, buildId, buildName, region);

    const resultPRParameters: CodeCommit.Types.PostCommentForPullRequestInput = {
      afterCommitId,
      beforeCommitId,
      pullRequestId,
      repositoryName,
      content,
    };

    console.log(resultPRParameters);

    // Put content on PR
    await commentCodeBuildResultOnPR(resultPRParameters);

    // Approve PR if build is successful
    await approvePR(buildStatus, revisionId, pullRequestId);

  } catch (err) {
    console.error(err);
    throw err;
  }
};
