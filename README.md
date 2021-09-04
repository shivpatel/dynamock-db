# DynamockDB
Ultralight AWS DynamoDB mock for Node.js

## Motivation
- Make it easy to mock DynamoDB for unit test.
- Remove the need for testing frameworks.
- Zero additional dependencies.
- Simulate DynamoDB's data storage model in local memory.

## Supported DynamoDB Features
- Multiple tables
- Partition key (string)
- Sort key (string)
- Promise returns

## Mocked Methods
DynamockDB mocks the following methods that are available on the [AWS.DynamoDB](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html) class in `aws-sdk` for Node.

- `getItem({ TableName, Key })`
- `putItem({ TableName, Item })`
- `query({ TableName, KeyConditionExpression, ExpressionAttributeValues })`
- `deleteItem({ TableName, Key })`

Note:
- `Key` contains the partition (and optionally sort) key marshalled.
- `KeyConditionExpression` only supports a single, equality check against the partition key. See example below.

## Example Usage

```js
const DynamockDB = require('dynamock-db')

const db = new DynamockDB({
  table1: { pKey: 'id' },
  table2: { pKey: 'zipcode', sKey: 'streetName' }
})


await db.putItem({
  TableName: 'table2',
  Item: {
    zipcode: { S: '30309' },
    streetName: { S: '10th Street NW' },
    other: { S: 'data' }
  }
}).promise()


const { Item } = await db.getItem({
  TableName: 'table2',
  Key: {
    zipcode: { S: '30309' },
    streetName: { S: '10th Street NW' }
  }
}).promise()


const { Items } = await db.query({
  TableName: 'table2',
  KeyConditionExpression: 'zipcode = :zipcode',
  ExpressionAttributeValues: {
    ':zipcode': { 'S': '30309' }
  }
}).promise()


await db.deleteItem({
  TableName: 'table2',
  Key: {
    zipcode: { S: '30309' },
    streetName: { S: '10th Street NW' }
  }
}).promise()
```