const autoBind = require("auto-bind")
const {
  LowStore
} = require("../../lib/lowstore")
const { escapeRegExp } = require("../../lib/util/javascript")
const {
  getNow,
  storedDataTypes,
  tagTypes,
  getTagType,
  iterateTaskTagIds: getTaskTagIds
} = require("./tagmodel")

function createDefaultTree() {
  const defaultTree = {}
  //create empty array for each stored type
  for (const type of storedDataTypes) {
    defaultTree[type] = []
  }
  return defaultTree
}

class TagStore extends LowStore {
  constructor(db) {
    super(db)
    autoBind(this) //allows use of methods as callbacks
  }

  saveItem(typeName, item) {
    const previousId = item.id
    const result = super.saveItem(typeName, item)
    if (item.id && (!previousId)) { //item was just created
      this.addTaskActionById(item.id, "create")
    }
    return result
  }


  lazyCreateTag(tagId) {
    let tagType = getTagType(tagId)
    let tag = this.getById(tagType, tagId)
    return tag ? tag : {
      id: tagId
    }
  }

  /**
   * iterateAllTagIds provides a deduplicated sequence of all tag ids in the store
   * including 'declared' tags : records containing a tag id and associated metadata
   * and 'minimal' tags : simply comma-separated id strings in a Task's string tags field
   */
  * iterateAllTagIds() {
    const iteratedIds = new Set()
    //declared tags (tags with metadata beyond just ids)
    for (let tagType of tagTypes) {
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

  * iterateAllTags() {
    for (let tagId of this.iterateAllTagIds()) {
      yield this.lazyCreateTag(tagId)
    }
  }

  * iterateTaskTags(task) {
    for (let tagId of getTaskTagIds(task)) {
      yield this.lazyCreateTag(tagId)
    }
  }

  /** Returns tags with ids containing all the (space separated) terms in filterString  */
  * iterateFilteredTags(filterString) {
    const terms = filterString.trim().split(/\s+/)
    const termPatterns = terms.map((term) => new RegExp(escapeRegExp(term), "i"))

    for (const tagId of this.iterateAllTagIds()) {
      for (const termPattern of termPatterns) {
        if (!termPattern.test(tagId)) {
          continue
        } else {
          yield this.lazyCreateTag(tagId)
          break //early termination  
        }
      }
    }
  }

  /** Returns tasks matching the space-separated terms in filterString.
   * - terms prefixed with a special character are searched only in task tagIds
   * - terms not prefixed with a special character are searched in task tagIds, label and note
   */
  * iterateFilteredTasks(filterString) {
    const terms = filterString.trim().split(/\s+/)
    for (const task of this.iterateByType("task")) {
      termLoop: for (const term of terms) {
        const termPattern = new RegExp(escapeRegExp(term), "i")
        //consider tag match
        for (let id of getTaskTagIds(task)) {
          if (termPattern.test(id)) { // matches term id
            yield task
            break termLoop
          }
        }
        //consider free text match
        if (getTagType(term) === "category") { //search free text (also note and label)
          for (const textField of ["label", "note"]) {
            if (textField in task) {
              if (termPattern.test(task[textField])) {
                yield task
                break termLoop
              }
            }
          }
        }
      }
    }
  }

  * iterateTaskActions(task) {
    if (task.actions) {
      yield* task.actions
    }
  }

  addTaskActionById(taskId, actionType, actionMap) {
    let result
    this.changeTable("task", table =>
      table.getById(taskId)
        .thru(task => {
          task.action = task.action || [] //lazy create array
          task.action.push({ //add action 
            type: actionType,
            instant: getNow(),
            ...actionMap
          })
          result = task
        })
    )
    if (result) {
      return result
    }
    else {
      throw `Couldn't insert ${actionType} in ${taskId} with ${actionMap}`
    }
  }
}



module.exports = {
  TagStore,
  createDefaultTree
}