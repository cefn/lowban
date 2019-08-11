const autoBind = require("auto-bind")
const { LowStore } = require("./lowstore")
const {
  iterateStoredTypes,
  getTagType,
  getTagTypes,
  getTaskTagIds
} = require("./tagmodel")

function defaultTreeFactory() {
  const defaultTree = {}
  //create empty array for each stored type
  for (type of iterateStoredTypes()) {
    defaultTree[type] = []
  }
  return defaultTree
}

class TagStore extends LowStore {
  constructor(db) {
    super(db)
    autoBind(this) //allows use of methods as callbacks
  }

  lazyCreateTag(tagId) {
    let tagType = getTagType(tagId)
    let tag = this.entityById(tagType, tagId)
    return tag ? tag : { id: tagId }
  }

  *getTaskTags(task) {
    for (tagId in getTaskTagIds(task)) {
      yield this.lazyCreateTag(tagId)
    }
  }

  /**
   * Provides a map of all tags by id
   * Declared tag Entities contain a tag id and associated metadata
   * Minimal tags are simply comma-separated ids in a Task's tag field
   * This function normalises all of them into a deduplicated map by id
   */
  createTagMap() {
    const tagMap = {}
    //declared tags (tags with metadata beyond just ids)
    for (let tagType of getTagTypes()) {
      for (let tag of this.iterateByType(tagType)) {
        if (!(tag.id in tagMap)) {
          tagMap[tag.id] = tag
        } else {
          throw "Duplicate declared tag"
        }
      }
    }
    //referenced tags (comma separated ids in tasks' tags property)
    for (let task of this.iterateByType("task")) {
      for (let id of getTaskTagIds(task)) {
        if (!(id in tagMap)) {
          //don't overwrite declared tags
          tagMap[id] = { id }
        }
      }
    }
    return tagMap
  }

  *getAllTags() {
    const tagMap = this.createTagMap()
    for (let tagId in tagMap) {
      yield tagMap[tagId]
    }
  }

  *getTaskTags(task) {
    for (let tagId of getTaskTagIds(task)) {
      yield this.lazyCreateTag(tagId)
    }
  }
}

module.exports = {
  TagStore,
  defaultTreeFactory
}
