const _ = require("lodash")
const lowdb = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")

/** Loads a lowdb database instance backed by a file at the given path */
function loadDb(dbPath) {
  return lowdb(new FileSync(dbPath)).defaults()
}

/** Class exposes limited retrieval signatures routing them to a lowdb database,
 * facilitating future migration to a different persistence engine.  */
class LowStore {
  constructor(db) {
    this.db = db
  }
  getOrCreateCollection(typeName) {
    if (this.db.has(typeName)) {
      let collection = this.db.get(typeName).value()
      if (Array.isArray(collection)) {
        return collection
      } else {
        throw `DB collection ${typeName} must be an Array`
      }
    } else {
      collection = []
      this.db.set(typeName, collection)
      this.scheduleWrite()
      return collection
    }
  }
  /** Factory for iterator traversing all items of a type */
  *iterateByType(typeName) {
    yield* this.getOrCreateCollection(typeName)
  }
  /** Returns the single object in the store of a given type and id */
  getById(typeName, id) {
    for (let entity of this.iterateByType(typeName)) {
      if (entity.id === id) {
        return entity
      }
    }
    return null
  }
  /** Inserts or merges an item of a given type into the store */
  saveItem(typeName, item) {
    let { id } = item
    if (typeof id === "string") {
      const prevItem = this.getById(typeName, id)
      if (item !== prevItem) {
        //need to set values in prevItem
        //delete old values
        for (const [key, value] of Object.entries(prevItem)) {
          delete prevItem[key]
        }
        //store new values
        for (const [key, value] of item) {
          prevItem[key] = item[value]
        }
      }
    } else {
      item.id = this.createId()
      const collection = this.getOrCreateCollection(typeName)
      collection.push(item)
    }
    this.scheduleWrite()
  }
  scheduleWrite() {
    this.db.write()
  }
  /** Creates a GraphQL resolver returning iterator over objects of a particular type. */
  entityResolverFactory(typeName) {
    return (parent, args, context, info) => this.iterateByType(typeName)
  }
}

module.exports = {
  loadDb,
  LowStore
}
