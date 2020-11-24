# Get account ID
echo "Please enter your account ID"
read ACCT_ID
echo "Enter name for Lambda function"
read LAMBDA_NAME 
echo "Enter name of DynamoDB Table"
read DYNAMO_NAME
echo "Enter AWS Region"
read REGION

# Cleaning AWS function if exists
aws lambda delete-function --function-name $LAMBDA_NAME --region $REGION

# Cleaning IAM Role if exists
aws iam detach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSLambdaFullAccess --role-name pdf-textract-role
aws iam detach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonTextractFullAccess --role-name pdf-textract-role
aws iam detach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --role-name pdf-textract-role
aws iam detach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess --role-name pdf-textract-role
aws iam delete-role --role-name pdf-textract-role

# Creating IAM Role
aws iam create-role --role-name pdf-textract-role --assume-role-policy-document file://role-policy.json
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSLambdaFullAccess --role-name pdf-textract-role
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonTextractFullAccess --role-name pdf-textract-role
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --role-name pdf-textract-role
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess --role-name pdf-textract-role

sleep 5

# Create Lambda Function
aws lambda create-function --function-name $LAMBDA_NAME \
                        --runtime python3.8 \
                        --memory 768 \
                        --handler index.handler \
                        --description "Convert PDF to CSV tables" \
                        --timeout 150 \
                        --region $REGION \
                        --environment Variables={DYNAMO_TABLE_NAME=$DYNAMO_NAME} \
                        --role arn:aws:iam::$ACCT_ID:role/pdf-textract-role \
                        --publish \
                        --zip-file fileb://function.zip