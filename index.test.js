const assert = require('assert')
const DynamockDB = require('./index')

describe('DynamockDB', function () {

  it('put/get item with partition key', async function () {

    const table = 'streets'
    const zip = '30309'

    const pKey = 'zipcode'

    const db = new DynamockDB({
      [table]: { pKey }
    })

    await db.putItem({
      TableName: table,
      Item: {
        [pKey]: { S: zip }
      }
    }).promise()

    const { Item } = await db.getItem({
      TableName: table,
      Key: {
        [pKey]: { S: zip }
      }
    }).promise()

    assert.strictEqual(Item[pKey].S, zip)
  })

  it('put/get item with partition and sort key', async function () {

    const table = 'streets'
    const zip = '30309'
    const street = '10th Street NW'

    const pKey = 'zipcode'
    const sKey = 'streetName'

    const db = new DynamockDB({
      [table]: { pKey, sKey }
    })

    await db.putItem({
      TableName: table,
      Item: {
        [pKey]: { S: zip },
        [sKey]: { S: street },
      }
    }).promise()

    const { Item } = await db.getItem({
      TableName: table,
      Key: {
        [pKey]: { S: zip },
        [sKey]: { S: street }
      }
    }).promise()

    assert.strictEqual(Item[pKey].S, zip)
    assert.strictEqual(Item[sKey].S, street)
  })

  it('query items with partition key', async function () {

    const table = 'streets'
    const zip = '30309'
    const street = '10th Street NW'
    const street2 = 'West Peacthree Street'

    const pKey = 'zipcode'
    const sKey = 'streetName'

    const db = new DynamockDB({
      [table]: { pKey, sKey }
    })

    await db.putItem({
      TableName: table,
      Item: {
        [pKey]: { S: zip },
        [sKey]: { S: street },
      }
    }).promise()

    await db.putItem({
      TableName: table,
      Item: {
        [pKey]: { S: zip },
        [sKey]: { S: street2 },
      }
    }).promise()

    const { Items } = await db.query({
      TableName: table,
      KeyConditionExpression: `${pKey} = :${pKey}`,
      ExpressionAttributeValues: {
        [`:${pKey}`]: { 'S': zip }
      }
    }).promise()

    assert.strictEqual(Items.length, 2)
    assert.strictEqual(Items[0][sKey].S, street)
    assert.strictEqual(Items[1][sKey].S, street2)
  })

  it('delete item with partition key', async function () {

    const table = 'streets'
    const zip = '30309'

    const pKey = 'zipcode'

    const db = new DynamockDB({
      [table]: { pKey }
    })

    await db.putItem({
      TableName: table,
      Item: {
        [pKey]: { S: zip }
      }
    }).promise()

    await db.deleteItem({
      TableName: table,
      Key: {
        [pKey]: { S: zip }
      }
    }).promise()

    const { Item } = await db.getItem({
      TableName: table,
      Key: {
        [pKey]: { S: zip }
      }
    }).promise()

    assert.strictEqual(Item, null)
  })

  it('delete item with partition and sort key', async function () {

    const table = 'streets'
    const zip = '30309'
    const street = '10th Street NW'

    const pKey = 'zipcode'
    const sKey = 'streetName'

    const db = new DynamockDB({
      [table]: { pKey, sKey }
    })

    await db.putItem({
      TableName: table,
      Item: {
        [pKey]: { S: zip },
        [sKey]: { S: street },
      }
    }).promise()

    await db.deleteItem({
      TableName: table,
      Key: {
        [pKey]: { S: zip },
        [sKey]: { S: street }
      }
    }).promise()

    const { Item } = await db.getItem({
      TableName: table,
      Key: {
        [pKey]: { S: zip },
        [sKey]: { S: street }
      }
    }).promise()

    assert.strictEqual(Item, null)
  })

})