# Amazon Textract Tabular Formatted Parser Application
The Amazon Textract Tabular Formatted Parser Application is a prototype created for the UoT Economics Department with the ability to scan tabular-formatted data from PDFs and images and save the results into a CSV format. 

## Stack 
* __Frontend__ - ReactJS (React 18) built with Vite, hosted on Amazon S3 + CloudFront.
* __Auth__ - Amazon Cognito (User Pool + Identity Pool) for user login and authentication, accessed from the frontend via the AWS Amplify library.
* __Data__ - Uploaded files and generated CSVs in Amazon S3; processing status in Amazon DynamoDB, accessed through a Status REST API (Amazon API Gateway + AWS Lambda) secured by a Cognito authorizer.
* __Backend__ - A Python 3.13 AWS Lambda function, deployed as a container image, that processes the uploaded file along with the confidence and page settings. It uses Amazon Textract to extract tabular data, stores the resulting CSV in Amazon S3, and updates the processing status in DynamoDB.
* __Infrastructure__ - All resources are defined in a single AWS SAM / CloudFormation template (`template.yaml`) and deployed with `./deploy.sh`. No Amplify CLI is required.

## High Level Architecture 

<img src="./public/architecture.png" width="800"/>

## Deployment 
To deploy this solution into your AWS account please follow the [deployment guide](deployment_guide.md)

## Local development

The frontend is a Vite app. After the backend has been deployed (which generates `src/aws-exports.js`), install dependencies and run the dev server from the project root:

```bash
npm install
npm run dev      # start the Vite dev server (http://localhost:3000)
npm run build    # production build into ./build
npm test         # run the test suite (Vitest)
```

## Credits

This prototype was coded by the UBC Students Jack Hou and Aamir Sheergar with the guidance from the UBC CIC technical team.

## License

This library is licensed under the Apache 2.0 License.