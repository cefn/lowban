const autoBind = require("auto-bind")
const { LowStore } = require("./lowstore")
const { getTagType, getTagTypes, getTaskTagIds } = require("./tagmodel")

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
      for (let tag of this.entitiesByType(tagType)) {
        if (!(id in tagMap)) {
          tagMap[id] = { id }
        } else {
          throw "Duplicate declared tag"
        }
      }
    }
    //referenced tags (comma separated ids in tasks' tags property)
    for (let task of this.entitiesByType("task")) {
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
    for (id in tagMap) {
      yield tagMap[id]
    }
  }

  *getTaskTags(task) {
    for (let tagId of getTaskTagIds(task)) {
      yield this.lazyCreateTag(tagId)
    }
  }
}

module.exports = {
  TagStore
}
