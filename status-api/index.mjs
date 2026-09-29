// Status API — replaces the former AppSync/GraphQL `Status` model.
//
// Routes (all require a Cognito User Pools JWT via the API Gateway authorizer):
//   POST   /status            create   { id, status, errorMessage?, expirationTime }
//   PATCH  /status/{id}        update   { status?, errorMessage? }
//   GET    /status/{id}        read
//
// Ownership: the item's `owner` attribute is set to the caller's Cognito `sub`
// on create; read/update verify the caller owns the item. The PdfToCsv
// backend Lambda writes to the same table directly (keyed by `id`) and is
// trusted, so it is not subject to this API-level owner check.

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  },
  body: JSON.stringify(body),
});

// Extract the caller's Cognito `sub` from the API Gateway authorizer claims.
const getOwner = (event) => {
  const claims = event.requestContext?.authorizer?.claims;
  return claims?.sub;
};

export const handler = async (event) => {
  try {
    const method = event.httpMethod;
    const owner = getOwner(event);
    if (!owner) {
      return response(401, { message: 'Unauthorized' });
    }

    if (method === 'OPTIONS') {
      return response(200, {});
    }

    // POST /status  — create
    if (method === 'POST') {
      const input = JSON.parse(event.body || '{}');
      if (!input.id) {
        return response(400, { message: 'id is required' });
      }
      const item = {
        id: input.id,
        owner,
        status: input.status ?? null,
        errorMessage: input.errorMessage ?? null,
        expirationTime: input.expirationTime,
      };
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
          ConditionExpression: 'attribute_not_exists(id)',
        })
      );
      return response(201, item);
    }

    const id = event.pathParameters?.id;
    if (!id) {
      return response(400, { message: 'id path parameter is required' });
    }

    // GET /status/{id} — read (owner-scoped)
    if (method === 'GET') {
      const { Item } = await ddb.send(
        new GetCommand({ TableName: TABLE_NAME, Key: { id } })
      );
      if (!Item || Item.owner !== owner) {
        return response(404, { message: 'Not found' });
      }
      return response(200, Item);
    }

    // PATCH /status/{id} — update (owner-scoped)
    if (method === 'PATCH') {
      const input = JSON.parse(event.body || '{}');
      const sets = [];
      const names = {};
      const values = { ':owner': owner };
      if (input.status !== undefined) {
        sets.push('#status = :status');
        names['#status'] = 'status';
        values[':status'] = input.status;
      }
      if (input.errorMessage !== undefined) {
        sets.push('#err = :err');
        names['#err'] = 'errorMessage';
        values[':err'] = input.errorMessage;
      }
      if (sets.length === 0) {
        return response(400, { message: 'No updatable fields provided' });
      }
      try {
        const { Attributes } = await ddb.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: 'set ' + sets.join(', '),
            ConditionExpression: 'attribute_exists(id) AND #owner = :owner',
            ExpressionAttributeNames: { ...names, '#owner': 'owner' },
            ExpressionAttributeValues: values,
            ReturnValues: 'ALL_NEW',
          })
        );
        return response(200, Attributes);
      } catch (err) {
        if (err.name === 'ConditionalCheckFailedException') {
          return response(404, { message: 'Not found' });
        }
        throw err;
      }
    }

    return response(405, { message: `Method ${method} not allowed` });
  } catch (err) {
    console.error('Status API error:', err);
    return response(500, { message: 'Internal server error' });
  }
};
