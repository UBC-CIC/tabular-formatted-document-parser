#!/bin/bash
# Full deployment: builds and deploys all backend resources via AWS SAM, then
# builds the React frontend and publishes it to S3 + CloudFront.
#
# Usage: ./deploy.sh [stack-name] [aws-region]
set -euo pipefail

STACK_NAME="${1:-uottextract}"
REGION="${2:-ca-central-1}"

echo "==> Building and deploying backend stack '${STACK_NAME}' in ${REGION}"
sam build
sam deploy \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --capabilities CAPABILITY_IAM \
    --resolve-image-repos \
    --resolve-s3 \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

echo "==> Generating frontend config (src/aws-exports.js)"
./generate_config.sh "${STACK_NAME}" "${REGION}"

echo "==> Building frontend"
npm ci
npm run build

echo "==> Publishing frontend to S3"
HOSTING_BUCKET=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='HostingBucketName'].OutputValue" --output text)
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text)
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text)

aws s3 sync build/ "s3://${HOSTING_BUCKET}/" --delete

echo "==> Invalidating CloudFront cache"
aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*" >/dev/null

echo ""
echo "Deployment complete."
echo "App URL: https://${CLOUDFRONT_DOMAIN}"
