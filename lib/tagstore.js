const autoBind = require("auto-bind")
const { LowStore } = require("./lowstore")
const {
  iterateStoredTypes,
  getTagType,
  getTagTypes,
  getTaskTagIds
} = require("./tagmodel")

function createDefaultTree() {
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
    let tag = this.getById(tagType, tagId)
    return tag ? tag : { id: tagId }
  }

  /**
   * iterateAllTagIds provides a deduplicated sequence of all tag ids in the store
   * including 'declared' tags : records containing a tag id and associated metadata
   * and 'minimal' tags : simply comma-separated id strings in a Task's string tags field
   */
  *iterateAllTagIds() {
    const iteratedIds = new Set()
    //declared tags (tags with metadata beyond just ids)
    for (let tagType of getTagTypes()) {
      for (let { id } of this.iterateByType(tagType)) {
        iteratedIds.add(id)
        yield id
      }
    }
    //referenced tags (comma separated ids in tasks' tags property)
    for (let task of this.iterateByType("task")) {
      for (let id of getTaskTagIds(task)) {
        if (iteratedIds.has(id)) {
          continue
        } else {
          iteratedIds.add(id)
          yield id
        }
      }
    }
  }

  *iterateAllTags() {
    for (let tagId of this.iterateAllTagIds()) {
      yield this.lazyCreateTag(tagId)
    }
  }

  *iterateTaskTags(task) {
    for (let tagId of getTaskTagIds(task)) {
      yield this.lazyCreateTag(tagId)
    }
  }
}

module.exports = {
  TagStore,
  createDefaultTree
}
