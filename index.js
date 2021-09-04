class DynamockDB {
  #db
  #tableMap

  constructor(tableMap = {}) {
    this.#db = {}
    this.#tableMap = tableMap

    for (let tableName in tableMap) {
      if (tableMap[tableName].pKey === undefined) {
        throw new Error(`partition key required for table=${tableName}`)
      }

      this.#db[tableName] = {}
    }
  }

  #validateTable(name) {
    if (this.#tableMap[name] === undefined) {
      throw new Error(`unknown table=${name}`)
    }
  }

  #validateSortKey(name, val) {
    if (name !== undefined && val === undefined) {
      throw new Error(`missing sort key=${name}`)
    }
  }

  #keyNamesFor(tableName) {
    const pKeyName = this.#tableMap[tableName].pKey
    const sKeyName = this.#tableMap[tableName].sKey
    return { pKeyName, sKeyName }
  }

  #extractCondition(conditionExpression) {
    const [key, attr] = conditionExpression.split(' = ')
    return [key, attr]
  }

  getItem(params) {
    const { TableName, Key } = params
    this.#validateTable(TableName)

    const { pKeyName, sKeyName } = this.#keyNamesFor(TableName)
    const pKey = Key[pKeyName]['S']
    const sKey = Key[sKeyName]?.['S']
    this.#validateSortKey(sKeyName, sKey)

    let Item
    if (sKey === undefined) {
      Item = this.#db[TableName][pKey]
    } else {
      Item = this.#db[TableName][pKey]?.[sKey]
    }

    return {
      promise: () => {
        return { Item: Item || null }
      }
    }
  }

  putItem(params) {
    const { TableName, Item } = params
    this.#validateTable(TableName)

    const { pKeyName, sKeyName } = this.#keyNamesFor(TableName)
    const pKey = Item[pKeyName]['S']
    const sKey = Item[sKeyName]?.['S']
    this.#validateSortKey(sKeyName, sKey)

    if (sKey === undefined) {
      this.#db[TableName][pKey] = Item
    } else {
      if (!this.#db[TableName][pKey]) {
        this.#db[TableName][pKey] = {}
      }
      this.#db[TableName][pKey][sKey] = Item
    }

    return {
      promise: () => {
        return
      }
    }
  }

  query(params) {
    const { TableName, ExpressionAttributeValues, KeyConditionExpression } = params
    this.#validateTable(TableName)

    const { pKeyName, sKeyName } = this.#keyNamesFor(TableName)
    const [conditionKey, conditionAttr] = this.#extractCondition(KeyConditionExpression)

    if (conditionKey !== pKeyName) {
      throw new Error(`DynamockDB only supports a single, equality check against the partition key`)
    }

    const pKey = ExpressionAttributeValues[conditionAttr]['S']

    const values = this.#db[TableName][pKey]
    let Items = []
    if (values !== undefined) {
      Items = sKeyName !== undefined ? Object.values(values) : [values]
    }

    return {
      promise: () => {
        return { Items }
      }
    }
  }

  deleteItem(params) {
    const { TableName, Key } = params
    this.#validateTable(TableName)

    const { pKeyName, sKeyName } = this.#keyNamesFor(TableName)
    const pKey = Key[pKeyName]['S']
    const sKey = Key[sKeyName]?.['S']
    this.#validateSortKey(sKeyName, sKey)

    if (sKey === undefined) {
      delete this.#db[TableName][pKey]
    } else {
      delete this.#db[TableName][pKey]?.[sKey]
    }

    return {
      promise: () => {
        return
      }
    }
  }

}

module.exports = DynamockDB