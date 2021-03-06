const _ = require("lodash")
const lowdb = require("lowdb")
const lodashId = require("lodash-id")
const FileSync = require("lowdb/adapters/FileSync")
const Memory = require("lowdb/adapters/Memory")
const stableStringify = require("json-stable-stringify")

_.mixin({
  sortWith: function (arr, customFn) {
    return _.map(arr).sort(customFn)
  }
})

const orderedKeys = ["label", "note", "tagIds", "id", "action"]
const orderedKeyComparator = ({ key: akey }, { key: bkey }) => {
  const apos = orderedKeys.indexOf(akey) + 1
  const bpos = orderedKeys.indexOf(bkey) + 1
  if (apos === bpos) {
    return akey < bkey ? 1 : -1
  }
  else {
    return apos > bpos ? 1 : -1
  }
}

const fileSyncOptions = {
  serialize: data => {
    return stableStringify(data, { space: "\t", cmp: orderedKeyComparator })
  }
}

function dbFromAdapter(lowDbAdapter, defaultTree = {}) {
  let db = new lowdb(lowDbAdapter)
  db._.mixin(lodashId) //https://github.com/typicode/lodash-id chains id-based operations
  db.defaultsDeep(defaultTree).write()
  return db
}

/** Loads a lowdb database instance backed by a file at the given path */
function dbFromPath(dbPath, defaultTree) {
  return dbFromAdapter(new FileSync(dbPath, fileSyncOptions), defaultTree)
}

function dbInMemory(defaultTree) {
  return dbFromAdapter(new Memory(), defaultTree)
}

/** Class exposes limited retrieval signatures routing them to a lowdb database,
 * facilitating future migration to a different persistence engine.  */
class LowStore {
  constructor(db) {
    this.db = db
  }

  lazyCreateTable(typeName) {
    if (!typeName) throw `Cannot create table for typeName ${typeName}`
    const typeList = this.db.get(typeName).value()
    if (typeList === undefined) {
      this.db.defaults({ [typeName]: [] }).write()
    }
    else if (!Array.isArray(typeList)) {
      throw `Path to table for ${typeName} actually contains ${typeList}`
    }
    return this.db.get(typeName)

  }
  /**
   * Make a change to the 'typeName' collection, using chained operators from lodash and lodash-id
   * @param {*} typeName the name of the collection
   * @param {*} fn receives collection chain, should apply operators and return it
   */
  changeTable(typeName, fn) {
    return fn(this.lazyCreateTable(typeName)).write()
  }

  /**
   * Query the 'typeName' collection, using chained operators from lodash and lodash-id
   * @param {*} typeName the name of the collection
   * @param {*} fn receives collection chain, should apply operators and return it
   */
  queryTable(typeName, fn) {
    return fn(this.lazyCreateTable(typeName)).value()
  }

  /** Factory for iterator traversing all items of a type */
  *iterateByType(typeName) {
    const collection = this.lazyCreateTable(typeName).value()
    yield* collection
  }

  //TODO consistent naming with iterateByType (e.g. iterateItemsByType)
  /** Factory for iterator traversing all ids of a type */
  *iterateIdsByType(typeName) {
    const collection = this.lazyCreateTable(typeName).value()
    for (const item of collection) {
      yield item.id
    }
  }

  /** Returns the single object in the store of a given type and id */
  getById(typeName, id) {
    return this.queryTable(typeName, table => table.getById(id))
  }

  /** Inserts or merges an item of a given type into the store */
  saveItem(typeName, item) {
    return this.changeTable(typeName, table => table.upsert(item))
  }

  mergeItem(typeName, item) {
    if (item.id) {
      const updatedItem = this.changeTable(typeName, table => table.updateById(item.id, item))
      if (updatedItem) {
        return updatedItem
      }
    }
    return this.saveItem(typeName, item)
  }

  removeItem(typeName, id) {
    if (id) {
      const item = this.changeTable(typeName, table => table.removeById(id))
      if (item !== undefined) {
        return true
      }
    }
    throw `Cannot remove item ${id}`
  }

  randomItem(typeName) {
    const sample = this.queryTable(typeName, table => table.sample())
    if (sample === undefined) return null
    return sample
  }

}

module.exports = {
  dbFromPath,
  dbInMemory,
  LowStore
}
