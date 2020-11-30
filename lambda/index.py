import boto3 
import botocore 
from PyPDF4 import PdfFileReader, PdfFileWriter
import pdf2image 
import time 
import json
import urllib.parse
import logging 
import base64 
import os 
import glob

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DYNAMOTABLE= os.getenv('DYNAMO_TABLE_NAME')

def get_pages(pdf_path, pages, output_path):
    logger.info(f'Getting Pages {pages}')
    logger.info(f'{pdf_path} to {output_path}')
    pdf_reader = PdfFileReader(pdf_path)
    pdf_writer = PdfFileWriter()
    if not pages or pages[0] == '': 
        # if user has not specified page numbers, extract from all pages
        for page in range(pdf_reader.getNumPages()):
            write_page(pdf_reader, pdf_writer, page)
    else: 
        # otherwise process the page numbers 
        for page in pages: 
            if (page.find("-") != -1):
                # format of page_start - page_end
                pgs = page.split('-')
                logger.info(pgs)
                for pg in range(int(pgs[0]),int(pgs[1])+1):
                    write_page(pdf_reader, pdf_writer, int(pg)-1)
            else: 
                write_page(pdf_reader, pdf_writer, int(page)-1)
    with open(output_path, 'wb') as out: 
        pdf_writer.write(out)

def write_page(reader, writer, page):
    pg = reader.getPage(page)
    writer.addPage(pg)
    logger.info(f'Appending Page#{page}')

def convert_to_imgs(pdf_path):
    logger.info("Converting PDF to Images")
    with open(pdf_path, 'rb') as f: 
        content = f.read()
    logger.info(content[:1500])
    folder_path = '/tmp/'
    file_names = pdf2image.convert_from_bytes(content, dpi=500, poppler_path='poppler_binaries/', output_folder=folder_path, fmt='JPEG', paths_only=True)
    logger.info(f'PDFs are {glob.glob(folder_path+"*.pdf")}')
    logger.info(f'Images are {file_names}')
    return file_names 

def textract_img(path_arr):
    textract = boto3.client('textract')
    result = []
    for path in path_arr: 
        img_file = open(path, "rb")
        logger.info(f'Reading File in Path {path}')
        data = img_file.read()
        response = textract.analyze_document(
            Document={
                'Bytes': data
            },
            FeatureTypes=["TABLES"]
        )
        result.append(response)
    logger.info("Finished Textract")
    return result 

def insert_into_s3(obj, bucket, objname): 
    s3_client = boto3.client('s3')
    s3_client.put_object(Body=obj, Bucket=bucket, Key=objname)
    logger.info(f'Inserted {objname} to S3 bucket {bucket}')

def get_s3_object(bucket, key, filename):
    s3_client = boto3.client('s3')
    try:    
        with open(filename, 'wb') as f:
            s3_client.download_fileobj(bucket, key, f)
    except ClientError as e: 
        raise e 

def get_json_s3(bucket, key):
    s3 = boto3.resource('s3')
    content_object = s3.Object(bucket, key)
    file_content = content_object.get()['Body'].read().decode('utf-8')
    return json.loads(file_content)

def get_rows_columns_map(table_result, blocks_map, confidence):
    rows = {}
    for relationship in table_result['Relationships']:
        if relationship['Type'] == 'CHILD':
            for child_id in relationship['Ids']:
                cell = blocks_map[child_id]
                if cell['BlockType'] == 'CELL':
                    row_index = cell['RowIndex']
                    col_index = cell['ColumnIndex']
                    if row_index not in rows:
                        # create new row
                        rows[row_index] = {}
                        
                    # get the text value
                    rows[row_index][col_index] = get_text(cell, blocks_map, confidence)
    return rows


def get_text(result, blocks_map, confidence):
    """
    Add confidence + remove comma 
    """
    text = ''
    if 'Relationships' in result:
        for relationship in result['Relationships']:
            if relationship['Type'] == 'CHILD':
                for child_id in relationship['Ids']:
                    word = blocks_map[child_id]
                    if word['BlockType'] == 'WORD' and word['Confidence'] >= confidence:
                        text += word['Text'] + ' '
                    if word['BlockType'] == 'SELECTION_ELEMENT':
                        if word['SelectionStatus'] =='SELECTED':
                            text +=  'X '    
    return text

def get_table_csv_results(response, confidence):
    # Get the text blocks
    blocks = []
    for page in response: 
        blocks.append(page['Blocks'])
    blocks_map = {}
    table_blocks = []

    for block_list in blocks:
        # print(type(block_list))
        print(f'block list length is {len(block_list)}')
        for block in block_list:
            # print(type(block))
            # print(f'Block is {block}')
            blocks_map[block['Id']] = block
            if block['BlockType'] == "TABLE":
                table_blocks.append(block)

    if len(table_blocks) <= 0:
        return "<b> NO TABLE FOUND </b>"

    csv = ''
    for index, table in enumerate(table_blocks):
        csv += generate_table_csv(table, blocks_map, index, confidence)
        csv += '\n\n'

    return csv

def generate_table_csv(table_result, blocks_map, table_index, confidence):
    rows = get_rows_columns_map(table_result, blocks_map, confidence)

    table_id = 'Table_' + str(table_index)
    
    # get cells.
    csv = 'Table: {0}\n\n'.format(table_id)

    for row_index, cols in rows.items():
        
        for col_index, text in cols.items():
            csv += '{}'.format(text) + ";"
        csv += '\n'
        
    csv += '\n\n\n'
    return csv

def find_nth(haystack, needle, n):
    # https://stackoverflow.com/questions/1883980/find-the-nth-occurrence-of-substring-in-a-string
    start = haystack.find(needle)
    while start >= 0 and n > 1:
        start = haystack.find(needle, start+len(needle))
        n -= 1
    return start

def handler(event, context):
    logger.info(event)
    # get the bucket info 
    bucket = event['Records'][0]['s3']['bucket']['name']
    #get the file/key name
    json_key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    # Get the amplify user from the prefix 
    amplify_user = json_key[find_nth(json_key,"/",1)+1:find_nth(json_key,"/",2)]
    json_content = get_json_s3(bucket, json_key)
    logger.info(f'Bucket is {bucket}')
    logger.info(f'Key for JSON is {json_key}')
    logger.info(f'Amplify User is: {amplify_user}')
    logger.info(f'Json Content is {json_content}')
    # Get contents of JSON 
    key = json_content["key"]
    logger.info(f'Key for file is {key}')
    output_path = '/tmp/s3_' + key
    file_path = '/tmp/' + key
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(DYNAMOTABLE)
    try: 
        # Get and download the s3 object 
        get_s3_object(bucket, "protected/"+amplify_user+"/"+key, file_path)
        # Check if file is PDF or Image type (JPEG, JPG, or PNG)
        if(json_content["file_type"] == 'pdf'):
            # Get the pages specified into a new file object 
            get_pages(file_path, json_content["pages"], output_path)
            # Convert the PDF to images 
            img_arr = convert_to_imgs(output_path)
        elif(json_content["file_type"] == 'jpeg' or json_content["file_type"] == 'jpg' or json_content["file_type"] == 'png'):
            img_arr = [file_path]
        response = textract_img(img_arr)
        table_csv = get_table_csv_results(response, int(json_content["confidence"]))
        logger.info(table_csv)
        output_key = 'protected/'+ amplify_user + '/csv/' + json_content["keyName"] + '.csv'
        insert_into_s3(table_csv, bucket, output_key)
        table.update_item(
            Key={'id': key},
            UpdateExpression='set #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'Success'}
        )
        return {'result' : "Success", 'Output' : output_key} 
    except IndexError: 
        logger.info("Index Error")
        table.update_item(
            Key={'id': key},
            UpdateExpression='set #status = :status, #err = :err',
            ExpressionAttributeNames={'#status': 'status', '#err': 'errorMessage'},
            ExpressionAttributeValues={':status': 'Error', ':err': 'Page out of range'}
        )
        return {'result': 'Error'}
    except (botocore.exceptions.ClientError, botocore.exceptions.ParamValidationError):
        logger.info("Botocore error")
        table.update_item(
            Key={'id': key},
            UpdateExpression='set #status = :status, #err = :err',
            ExpressionAttributeNames={'#status': 'status', '#err': 'errorMessage'},
            ExpressionAttributeValues={':status': 'Error', ':err': 'AWS Botocore Error'}
        )
        return {'result': 'Error'}
    except: 
        logger.info("Error")
        table.update_item(
            Key={'id': key},
            UpdateExpression='set #status = :status, #err = :err',
            ExpressionAttributeNames={'#status': 'status', '#err': 'errorMessage'},
            ExpressionAttributeValues={':status': 'Error', ':err': 'Could not convert data'}
        )
        return {'result': 'Error'}
