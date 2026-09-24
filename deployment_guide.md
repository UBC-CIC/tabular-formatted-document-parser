# Deployment Guide
Before deployment, you should have the following: 

* An AWS account with required permissions. If you do not have an AWS account, create and activate one.
* Access to Git.
* Docker installed and running (required by `sam build` to build the Lambda container image)
* AWS CLI installed
* AWS SAM CLI installed
* Amplify CLI installed
* Bash terminal
* GitHub Account 

## Deployment steps

1.	**Fork** this solution repository, then **clone** your fork locally.

2.	If you haven't configured Amplify before, configure the Amplify CLI in your terminal as follows:

    ```bash
    amplify configure
    ```

3.	In a terminal from the project root directory, enter the following command, selecting the IAM user of the AWS account you will deploy this application from (accept all defaults):

    ```bash
    amplify init
    ```

4.	After the Amplify project has been initialized, in your terminal again from the project root directory, enter the following command (select "Yes" for all options):

    ```bash
    amplify push
    ```

5.	After Amplify successfully creates all the backend resources, execute the following command to deploy the Lambda function that pre- and post-processes the PDF files. This script automates the following steps:

    a.	Identifies the AWS resources AWS Amplify created (the S3 bucket and DynamoDB table).

    b.	Builds and deploys the AWS Lambda function as a **container image** using AWS SAM. `sam build` uses Docker to build the image defined by the `Dockerfile` (Python 3.13 base image with `poppler-utils` and the Python dependencies), and `sam deploy` pushes it to Amazon ECR and creates/updates the CloudFormation stack. The ECR repository is created and managed automatically via `--resolve-image-repos`.

    c.	Configures the Amazon S3 event notification that triggers the AWS Lambda function on upload.

    ```bash
    ./deploy_lambda.sh
    ```

    > **First run:** if this is the first SAM deployment in your account/region, SAM may need to bootstrap its managed resources (a deployment bucket and ECR repositories). If the non-interactive deploy fails asking for configuration, run `sam deploy --guided` once from the project root to seed a `samconfig.toml`, then re-run `./deploy_lambda.sh`.

    > **Note:** each deployment pushes a new image to the SAM-managed ECR repository. Over time you may want to add an ECR lifecycle policy to prune old images.

6.	In your browser, go to the AWS Amplify service page in the AWS Console and select the app you just created.

7.	Click on the "Frontend environments" tab, select "GitHub" under the "Host a web app" section, then click Connect branch.

8.	Select the repository that contains your fork of this project. Click Next.

9.	From the "Select a backend environment" dropdown, select dev.

10.	Click the "Create a new role" button and accept all defaults. Click the refresh button and select the role you just created in the dropdown menu. Click Next.

11.	Click Save and deploy.

12.	Wait until the Provision, Build, Deploy, and Verify indicators are all green.