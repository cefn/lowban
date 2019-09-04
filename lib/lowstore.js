const _ = require("lodash")
const lowdb = require("lowdb")
const lodashId = require("lodash-id")
const FileSync = require("lowdb/adapters/FileSync")
const Memory = require("lowdb/adapters/Memory")
const stableStringify = require("json-stable-stringify")

_.mixin({
  sortWith : function(arr, customFn) {
    return _.map(arr).sort(customFn)
  }
}) 

const fileSyncOptions = {
  serialize: data => {
    return stableStringify(data, { space: "\t" })
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
    this.db.defaults({ [typeName]: [] }).write()
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
  /** Returns the single object in the store of a given type and id */
  getById(typeName, id) {
    return this.queryTable(typeName, table => table.getById(id))
  }
  /** Inserts or merges an item of a given type into the store */
  saveItem(typeName, item) {
    return this.changeTable(typeName, table => table.upsert(item))
  }
}

module.exports = {
  dbFromPath,
  dbInMemory,
  LowStore
}
