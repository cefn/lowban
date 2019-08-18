/**
 * Defines a model for tagged tasks.
 * Tags allow tasks to be filtered, ordered and grouped in a view or process.
 * Tasks are object literals with a tagIds property - an array of tag ids.
 *
 * Tag ids may be prefixed by special characters indicating the tag type.
 * For example, a '!' prefix like '!urgent' defines a priority level for a task, a '@' prefix
 * like '@home' defines a context for completing the task, and a '#' prefix defines a status.
 *
 * Tag metadata objects can add extra information beyond just the id. For example, you can associate
 * a #waiting status with a title indicating the meaning of the status. Similarly a context may
 * have a lat-long indicating a physical location in the globe.
 * @module tagmodel
 */

/** Maps prefixes to lowercase tagType names */
const tagTypeByPrefix = {
  "!": "priority",
  "#": "status",
  "@": "context",
  "": "category"
}

/** Names of separately-stored data types in the model - one name for each tag type, plus "task" */
function* iterateStoredTypes() {
  yield* Object.values(tagTypeByPrefix)
  yield "task"
}

/** Names of separately-queryable data types - one name for each stored type, plus "tag" an aggregate of all tag types  */
function* iterateTraversableTypes() {
  yield* iterateStoredTypes()
  yield "tag"
}

/** Lists all defined tag types */
function getTagTypes() {
  return Object.values(tagTypeByPrefix)
}

/** The type of a tag is determined by the first character of its id */
function getTagType(tagId) {
  let prefix = tagId.slice(0, 1)
  if (!(prefix in tagTypeByPrefix)) {
    prefix = ""
  }
  return tagTypeByPrefix[prefix]
}

/**
 * Generates tag ids from a task's optional comma-separated tagIds property.
 * @param {} task
 */
function* getTaskTagIds(task) {
  if (Array.isArray(task.tagIds)) {
    for (let entry of task.tagIds) {
      yield entry
    }
  }
}

module.exports = {
  iterateStoredTypes,
  iterateTraversableTypes,
  getTagType,
  getTagTypes,
  getTaskTagIds
}
