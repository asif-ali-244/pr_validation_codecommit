import boto3
from botocore.exceptions import ClientError
import logging
import os
import json

logging.getLogger().setLevel(logging.INFO)

BUILD_MAP_PARAMETER_NAME = os.environ["BUILD_MAP_PARAMETER_NAME"]
APPROVER = os.environ["APPROVER"]

def getBuildName(repoName:str):
    ssm = boto3.client('ssm')
    parameter = ssm.get_parameter(Name=BUILD_MAP_PARAMETER_NAME)['Parameter']['Value']
    logging.info(parameter)
    buildMap = json.loads(parameter)
    return buildMap[repoName]

def triggerCodeBuild(params):
    try:
        client = boto3.client('codebuild')

        logging.info("triggering code build pr project")
        build = client.start_build(
            projectName = params.get("codeBuildName"),
            sourceVersion = params["sourceCommit"],
            environmentVariablesOverride = [
                {
                    "name": "pullRequestId",
                    "value": params.get("pullRequestId"),
                    "type": "PLAINTEXT"
                },
                {
                    "name": "sourceCommit",
                    "value": params.get("sourceCommit"),
                    "type": "PLAINTEXT"
                },
                {
                    "name": "destinationCommit",
                    "value": params.get("destinationCommit"),
                    "type": "PLAINTEXT"
                },
                {
                    "name": "pullRequestName",
                    "value": params.get("pullRequestName"),
                    "type": "PLAINTEXT"
                },
                {
                    "name": "repositoryName",
                    "value": params.get("repositoryName"),
                    "type" : "PLAINTEXT"
                },
                {
                    "name": "revisionId",
                    "value": params.get("revisionId"),
                    "type" : "PLAINTEXT"
                }
            ]
        )
    except Exception as err:
        logging.exception('Error In Starting Codebuild')
        raise err
    return build["build"]["id"]

def postBuildStartedCommentOnPR(params):
    logLink = f'https://{params["region"]}.console.aws.amazon.com/codesuite/codebuild/projects/{params["codeBuildName"]}/build/{params["buildId"]}'
    try:
        client = boto3.client('codecommit')
        client.post_comment_for_pull_request(
            pullRequestId=params["pullRequestId"],
            repositoryName=params["repositoryName"],
            beforeCommitId=params["sourceCommit"],
            afterCommitId=params["destinationCommit"],
            content= f'Build for Validating Pull Request has been started. Check [CodeBuild Logs]({logLink})'
        )
    except Exception as err:
        logging.exception('Error In Commenting To Pull Request')
        raise err

def addApproverToPr(pullRequestId: str, accountId: str):

    approval_rule_content = {
        "Version": '2018-11-08',
        "Statements":[
            {
                "Type":"Approvers",
                "NumberOfApprovalsNeeded": 1,
                "ApprovalPoolMembers": [
                    f"arn:aws:sts::{accountId}:assumed-role/{APPROVER}"
                ]
            }
        ]
    }
    try:
        client = boto3.client('codecommit')
        client.create_pull_request_approval_rule(
            pullRequestId=pullRequestId,
            approvalRuleName='pr-approval',
            approvalRuleContent=json.dumps(approval_rule_content)
        )
    except ClientError as err:
        if err.response['Error']['Code'] == 'ApprovalRuleNameAlreadyExistsException':
            logging.info('Rule already exist')
        else:
            logging.exception('Error In Adding approval rule to PR')
            raise err

def handler(event, context):

    logging.info(f'event: {event}')

    destinationCommit = event.get("detail").get("destinationCommit")
    sourceCommit = event.get("detail").get("sourceCommit")
    sourceBranch = event.get("detail").get("sourceReference").split("/")[-1]
    pullRequestId = event.get("detail").get("pullRequestId")
    pullRequestName = event.get("detail").get("title")
    revisionId = event.get("detail").get("revisionId")
    repositoryName = event.get("detail").get("repositoryNames")[0]
    region = event.get("region")
    accountId = event.get("account")

    codeBuildName = getBuildName(repositoryName)

    codeBuildParameters = {
        "sourceCommit": sourceCommit,
        "sourceBranch": sourceBranch,
        "destinationCommit": destinationCommit,
        "pullRequestId": pullRequestId,
        "pullRequestName": pullRequestName,
        "repositoryName": repositoryName,
        "codeBuildName": codeBuildName,
        "revisionId": revisionId
    }

    logging.info(f'codebuild params: {json.dumps(codeBuildParameters)}')

    codeBuildId = triggerCodeBuild(codeBuildParameters)

    postCommentOnPRParameters = {
        "buildId": codeBuildId,
        "sourceCommit": sourceCommit,
        "destinationCommit": destinationCommit,
        "pullRequestId": pullRequestId,
        "repositoryName": repositoryName,
        "codeBuildName": codeBuildName,
        "region": region
    }
    logging.info(f'comment on PR params: {json.dumps(postCommentOnPRParameters)}')

    # Post comment on PR
    postBuildStartedCommentOnPR(postCommentOnPRParameters)

    # Add approval rule to PR
    addApproverToPr(pullRequestId, accountId)

    return json.dumps({
        "status": 200,
        "message": "successful"
    })

