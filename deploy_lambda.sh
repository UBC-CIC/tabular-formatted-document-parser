#!/bin/bash
set -euo pipefail

if [[ ! -f "./amplify/.config/project-config.json" ]]; then
    echo 'Project file does not exist'
    exit 1
fi

PROJECT_NAME=$(cat ./amplify/.config/project-config.json | jq -r '.projectName')
if [ -z "$PROJECT_NAME" ]; then
    echo 'Unable to find PROJECT NAME'
    exit 1
fi
echo "Project Name: ${PROJECT_NAME}"
S3_BUCKET=$(aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="${PROJECT_NAME}" --resource-type-filters s3 --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | grep -v deployment | awk -F':::' '{print $2}')
if [ -z "$S3_BUCKET" ]; then
    echo 'Unable to find S3 BUCKET'
    exit 1
fi
echo "Bucket Name: ${S3_BUCKET}"
DYNAMO_TABLE=$(aws resourcegroupstaggingapi get-resources --tag-filters Key=user:Application,Values="${PROJECT_NAME}" --resource-type-filters dynamodb --query 'ResourceTagMappingList[*].[ResourceARN]' --output text | cut -f2- -d/)
if [ -z "$DYNAMO_TABLE" ]; then
    echo 'Unable to find DYNAMO TABLE'
    exit 1
fi
echo "DynamoDb Table: ${DYNAMO_TABLE}"

echo "Building Lambda container image"
# Builds the container image defined by the function's Metadata (Dockerfile /
# DockerContext) and tags it locally.
sam build

echo "Deploying stack"
# --resolve-image-repos lets SAM create and manage the ECR repository for the
# image function automatically (via its managed bootstrap stack), so no ECR
# repo has to be created by hand.
sam deploy \
    --stack-name "${PROJECT_NAME}Lambda" \
    --capabilities CAPABILITY_IAM \
    --resolve-image-repos \
    --no-confirm-changeset \
    --parameter-overrides "s3Bucket=${S3_BUCKET}" "DynamoDbTable=${DYNAMO_TABLE}"

LAMBDA_ARN=$(aws cloudformation describe-stacks --stack-name "${PROJECT_NAME}Lambda" --query "Stacks[0].Outputs[?OutputKey=='PdfToCsvArn'].OutputValue" --output text)
if [ -z "$LAMBDA_ARN" ]; then
    echo 'Unable to find LAMBDA ARN'
    exit 1
fi
echo "Lambda: ${LAMBDA_ARN}"

sed "s|%LambdaArn%|$LAMBDA_ARN|g" notification.json > notification.s3
aws s3api put-bucket-notification-configuration --bucket "${S3_BUCKET}" --notification-configuration file://notification.s3 --output text
