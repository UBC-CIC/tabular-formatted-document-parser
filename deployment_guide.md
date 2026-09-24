# Deployment Guide

This application deploys entirely through **AWS SAM / CloudFormation** — no Amplify CLI is required. A single `template.yaml` provisions all backend resources (Cognito, S3, DynamoDB, the Status API, and the PDF→CSV Lambda) plus the S3 + CloudFront frontend hosting.

## Prerequisites

* An AWS account with permissions to create the resources in `template.yaml` (Cognito, S3, DynamoDB, Lambda, API Gateway, CloudFront, IAM).
* AWS CLI installed and configured with credentials (`aws configure`).
* AWS SAM CLI installed.
* Docker installed and running (required by `sam build` to build the PDF→CSV Lambda container image).
* Node.js and npm installed (to build the React frontend).
* A Bash terminal.

## One-command deployment

From the project root:

```bash
./deploy.sh [stack-name] [aws-region]
```

Defaults: stack name `uottextract`, region `ca-central-1`.

The script performs the full deployment:

1. `sam build` — builds the PDF→CSV Lambda container image and the Status API function.
2. `sam deploy` — creates/updates the CloudFormation stack (all backend resources + hosting bucket + CloudFront). The ECR repository for the image function and the SAM deployment bucket are created and managed automatically (`--resolve-image-repos`, `--resolve-s3`).
3. `./generate_config.sh` — reads the stack outputs and writes `src/aws-exports.js` (the Amplify client configuration: Cognito, S3, and the Status API endpoint).
4. `npm ci && npm run build` — builds the React frontend (Vite) into `./build`.
5. `aws s3 sync build/ …` — publishes the build to the hosting bucket.
6. `aws cloudfront create-invalidation …` — invalidates the CloudFront cache.

On completion the script prints the CloudFront URL (`https://<distribution>.cloudfront.net`) where the app is served.

> **First run:** if this is the first SAM deployment in your account/region, SAM will bootstrap its managed resources. If `sam deploy` prompts for configuration, run `sam deploy --guided` once to seed a `samconfig.toml`, then re-run `./deploy.sh`.

## Creating a user

The Cognito User Pool has no users initially and self-signup is available through the app's login screen (Amplify's `withAuthenticator`). Alternatively, create a user via the CLI:

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <UserPoolId-from-stack-outputs> \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com Name=email_verified,Value=true
```

## Redeploying frontend-only changes

If you only changed frontend code, you can skip the backend build and just rebuild + republish:

```bash
npm run build
aws s3 sync build/ "s3://<HostingBucketName>/" --delete
aws cloudfront create-invalidation --distribution-id <CloudFrontDistributionId> --paths "/*"
```

## Tearing down

Because this is a prototype with disposable data, the S3 buckets and DynamoDB table use `DeletionPolicy: Delete`. To remove everything:

```bash
# Empty the buckets first (CloudFormation cannot delete non-empty buckets).
aws s3 rm "s3://<DataBucketName>" --recursive
aws s3 rm "s3://<HostingBucketName>" --recursive
sam delete --stack-name <stack-name>
```
