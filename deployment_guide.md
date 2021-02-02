# Deployment Guide
Before deployment, you should have the following: 

* An AWS account with required permissions. If you do not have an AWS account, create and activate one.
* Access to Git.
* Docker installed
* AWS CLI installed
* AWS SAM installed
* Amplify CLI installed
* Bash terminal
* GitHub Account 

## Deployment steps

1.	**Clone** and **Fork** this solution repository.
3.	If you haven't configured Amplify before, configure the Amplify CLI in your terminal as follows:

```bash
amplify configure
```

4.	In a terminal from the project root directory, enter the following command selecting the IAM user of the AWS Account you will deploy this application from. (accept all defaults):

```bash
amplify init
```

5.	Next, after the Amplify project has been initialized, in your terminal again from the project root directory, enter the following command (select "Yes" for all options):

```
amplify push
```

6.	After amplify successfully creates all the backend resource, execute the following command to deploy the Lambda function that pre and pos process the PDF files. This script automates the following steps:
a.	Identify the AWS resources AWS Amplify created
b.	Package and deploy the AWS Lambda function with all required libraries using Docker and SAM
c.	Configures the Amazon S3 event notification to the AWS Lambda Function

```bash
deploy_lambda.sh
```

7.	Next, in your browser go to the AWS Amplify service page in the AWS Console. Select the app you just created.
8.	Next, click on the "frontend environments" tab and select "Github" under the "Host a web app" section then click Connect branch.
9.	Select the repository that contains the fork of this project. Click Next.
10.	From the Select a backend environment dropdown, select dev.
11.	Next, click on the Create a new role button and accept all defaults. Now click the refresh button and select the role you just created in the dropdown menu. Click Next.
12.	Click Save and deploy.
13.	Wait until the Provision, Build, Deploy and Verify indicators are all green.