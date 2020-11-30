#
# lambda.sh
# For Linux Environment 
# Used for updating lambda function
# Assumption: lambda function has already been created using create_lambda.sh or create_lambda.bat 
# Assumption: Uses the same environment as Python3.8 found in AWS Lambda 
# See https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html for more information on the environment to use  

echo "Please enter lambda function to update"
read LAMBDA_NAME

# Clean up before starting
rm -rf env/
rm -rf package/
rm function.zip

# Build poppler
rm -rf poppler_binaries/
./build_poppler.sh

# Make a virtualenv
python3.8 -m venv env/
source env/bin/activate

# Creating the package
mkdir -p package
pip3.8 install pdf2image --target package/
pip3.8 install pypdf4 --target package/

# Moving the poppler libraries in the package
cp -r poppler_binaries/ package/

# Moving the function in the package 
cp index.py package/

# Zipping the package
cd package
zip -r9 ../function.zip *
cd ..

# Deleting package artifacts
rm -rf package/

# Updating lambda function
# Read More at: https://docs.aws.amazon.com/lambda/latest/dg/python-package.html
aws lambda update-function --function-name $LAMBDA_NAME --zip-file fileb://function.zip
