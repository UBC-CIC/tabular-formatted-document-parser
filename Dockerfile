# Lambda container image built on the official AWS Lambda Python 3.13 base
# image (Amazon Linux 2023). poppler is installed system-wide so pdf2image
# finds pdftoppm / pdfinfo / pdftocairo on PATH — no manual binary/shared-lib
# bundling required.
FROM public.ecr.aws/lambda/python:3.13

# poppler-utils provides the CLI tools pdf2image shells out to.
RUN dnf install -y poppler-utils && dnf clean all

# Install Python dependencies into the Lambda task root.
COPY requirements.txt ${LAMBDA_TASK_ROOT}/requirements.txt
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Application code.
COPY lambda/index.py ${LAMBDA_TASK_ROOT}/index.py

# Handler: <module>.<function>
CMD [ "index.handler" ]
