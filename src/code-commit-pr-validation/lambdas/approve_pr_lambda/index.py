import boto3
import logging
import json

logging.getLogger().setLevel(logging.INFO)

def getContent(buildStatus, buildId, buildName, region):
    id= buildId.split("/")[-1]

    logLink = f'https://{region}.console.aws.amazon.com/codesuite/codebuild/projects/{buildName}/build/{id}'
    if buildStatus == "SUCCEEDED":
        content = f'### &#9989 BUILD SUCCEEDED. Check [Logs]({logLink})'
    else:
        content = f'### &#10060 BUILD FAILED. Check [Logs]({logLink})'

    return content

def approvePR(buildStatus, revisionId, pullRequestId):

    if buildStatus == "SUCCEEDED":
        try:
            client = boto3.client('codecommit')
            client.update_pull_request_approval_state(
                pullRequestId= pullRequestId,
                revisionId=revisionId,
                approvalState='APPROVE'
            )

        except Exception as err:
            logging.exception('Error In approving the PR')
            raise err


def commentCodeBuildResultOnPR(params):
    try:
        client = boto3.client('codecommit')
        client.post_comment_for_pull_request(
            pullRequestId=params["pullRequestId"],
            repositoryName=params["repositoryName"],
            beforeCommitId=params["beforeCommitId"],
            afterCommitId=params["afterCommitId"],
            content= params["content"]
        )

    except Exception as err:
        logging.exception('Error In Commenting To Pull Request')
        raise err

def handler(event, context):

    logging.info(f'event: {event}')

    buildId = event["detail"]["build-id"]
    buildName = event["detail"]["project-name"]
    buildStatus = event["detail"]["build-status"]
    region = event["region"]
    environmentVariableList = event["detail"]["additional-information"]["environment"]["environment-variables"]

    afterCommitId = beforeCommitId = pullRequestId = repositoryName = pullRequestName = revisionId = None

    for element in environmentVariableList:
        if element["name"]=="pullRequestId":
            pullRequestId = element["value"]
        if element["name"]=="sourceCommit":
            beforeCommitId = element["value"]
        if element["name"]=="destinationCommit":
            afterCommitId = element["value"]
        if element["name"]=="repositoryName":
            repositoryName = element["value"]
        if element["name"]=="pullRequestName":
            pullRequestName = element["value"]
        if element["name"]=="revisionId":
            revisionId = element["value"]

    # get content to put on PR activity tab
    content = getContent(buildStatus,buildId, buildName, region)

    resultPRParameters = {
        "afterCommitId": afterCommitId,
        "beforeCommitId": beforeCommitId,
        "pullRequestId" : pullRequestId,
        "repositoryName" : repositoryName,
        "pullRequestName" : pullRequestName,
        "buildStatus":buildStatus,
        "content": content
    }

    logging.info(f"result PR parameters: {resultPRParameters}")

    # put content on PR
    commentCodeBuildResultOnPR(resultPRParameters)

    # approve PR if build is successful
    approvePR(buildStatus,revisionId,pullRequestId)

    return json.dumps({
        "status":200,
        "message": "success"
    })
