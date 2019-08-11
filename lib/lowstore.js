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

  /** Factory for iterator traversing all items of a type */
  *iterateByType(typeName) {
    let collection = this.db.get(typeName).value()
    if (Array.isArray(collection)) {
      yield* collection
    } else {
      throw "Top level items should be Arrays"
    }
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
  /** Creates a GraphQL resolver returning iterator over objects of a particular type. */
  entityResolverFactory(typeName) {
    return (parent, args, context, info) => this.iterateByType(typeName)
  }
}

module.exports = {
  loadDb,
  LowStore
}
