/**
 * Defines a model for tagged tasks.
 * Tags allow tasks to be filtered, ordered and grouped in a view or process.
 * Tasks are object literals with a string tags property - a comma-separated list of tag ids.
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
 * Generates tag ids from a task's optional comma-separated tags property.
 * @param {} task
 */
function* getTaskTagIds(task) {
  if (typeof task.tags === "string") {
    for (let entry of task.tags.split(",")) {
      yield entry.trim()
    }
  }
}
