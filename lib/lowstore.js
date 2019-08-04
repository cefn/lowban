const lowdb = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")

function loadDb(dbPath) {
  const adapter = new FileSync(dbPath)
  const db = lowdb(adapter)
  return db
}

class LowStore {
  constructor(db) {
    this.db = db
  }
  /** Top level children are either an object literal with ids mapping
   * to entity object literals, or a list containing entity object literals
   * which each have an id property
   */
  *entitiesByType(typeName) {
    let collection = this.db.get(typeName).value()
    if (Array.isArray(collection)) {
      yield* collection
    } else if (_.isPlainObject(collection)) {
      for (id in collection) {
        yield Object.assign({ id }, collection[id]) //merge id into object properties
      }
    } else {
      throw "Top level items should be collections"
    }
  }
  entityById(typeName, id) {
    for (entity of this.entitiesByType(typeName)) {
      if (entity.id === id) {
        return entity
      }
    }
    return null
  }
  entityResolverFactory(typeName) {
    return (parent, args, context, info) => this.entitiesByType(typeName)
  }
}

module.exports = {
  loadDb,
  LowStore
}
