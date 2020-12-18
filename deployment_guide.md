# Deployment Guide
Before deployment, you should have the following: 

* [AWS Account](https://aws.amazon.com/account/)
* [Amplify CLI installed](https://docs.amplify.aws/cli)
* [GitHub Account](https://github.com)
* [Node 10 or greater](https://nodejs.org/en/download/)

## Frontend Deployment

1) Fork then clone this repository.
2) Delete the "team-provider-info.json" file located under the "amplify" folder. Amplify will generate a new one specific for your AWS account.
3) Open a browser and log into the [AWS Management Console](https://aws.amazon.com/console/). 
4) If you haven't configured Amplify before, configure the Amplify CLI in your terminal as follows:
```javascript
amplify configure
```
5) In a terminal from the project root directory, enter the following command (accept all defaults):
```javascript
amplify init
```
6) Next, after the Amplify project has been initialized, in your terminal again from the project root directory, enter the following command (select "Yes" for all options):
```javascript
amplify push
```
7) Next, in your browser go to the AWS Amplify service page in the AWS Console. Select the app you just created.
8) Next, click on the "frontend environments" tab and select "Github" under the "Host a web app" section then click **Connect branch**.
9) Select the repository that contains the fork of this project. Click **Next**.
10) From the *Select a backend environment* dropdown, select *dev*.
11) Next, click on the **Create a new role** button and accept all defaults. Now click the refresh button and select the role you just created in the dropdown menu. Click **Next**.
12) Click **Save and deploy**.
13) Wait until the Provision, Build, Deploy and Verify indicators are all green.
14) From the Amplify console, navigate to __Backend environments__ -> __File storage__ and click on __View in S3__. We will be using this bucket later to connect to the Backend Lambda function. 
15) Navigate to AWS DynamoDB and find the table that Amplify created. It should start with Status. Copy that for the Backend as well. 

## Backend Deployment
Deploy the backend application onto AWS Lambda function.
### Build Instructions 
This application requires the frontend Amplfy Application to be setup and running on the same account and region. 
1. Navigate to the Lambda folder in the project repo and run the `create_lambda.bat` script for Windows machines or `create_lambda.sh` for Linux machines and follow the prompts. 
2. The AWS Account ID can be found in the Account Settings in the Console. 
3. The DynamoDB table name can be found by searching DynamoDB and clicking on __Tables__. The corresponding table should start with _Status_. 
4. The region should be the same as the region you used to create the Amplify Application ie. ca-central-1. 
3. In the AWS console, navigate to the newly created lambda function
4. Click on the Add Trigger Option 

![Add Trigger](public/lambda_trigger.PNG)

4. Add a S3 create object trigger associated to the S3 bucket that Amplify created in the Frontend Deployment

![Trigger Configuration](public/lambda_trigger_2.PNG)

### Updates
If you make any updates to `index.py`, you must run `lambda.sh` on a machine with the same OS as Python3.8 in AWS Lambda 
    - see [here](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html) for more information
