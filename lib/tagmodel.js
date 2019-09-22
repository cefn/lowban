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

const {
  jointComparatorFactory
} = require("../lib/util/javascript")
const _ = require("lodash")

//Define a pattern matches both space-separated tags, AND quoted space-separated tags
const tagPrefixPattern = /[!#@~|]/g //defines possible tag prefix characters
const tagPhrasePattern = /(["'])([^\1]+?)\1/g //bounded by quotes (can contain spaces)
const tagWordPattern = /([^\s]+)/g //separated by spaces (cannot contain spaces)
const tagPattern = (() => {
  const prefix = tagPrefixPattern.source + "?" //make prefix optional
  const phrase = tagPhrasePattern.source.replace(/1/g, "3") //opening delimiter capture group is nested 2 deep in disjunction below
  const word = tagWordPattern.source //noop gives word capture group the same ordinal as phrase capture group
  return new RegExp(`${prefix}((${phrase})|(${word}))`) //pattern matching a single tag anywhere in a string
})()

const singleTagPattern = new RegExp(`^${tagPattern.source}$`) //pattern with anchors matching only a standalone tag  
const multipleTagPattern = new RegExp(tagPattern.source, "g") //pattern with global flag returning multiple matches of single tags

/** Maps prefixes to lowercase tagType names */
const tagTypeByPrefix = {
  "!": "priority",
  "#": "status",
  "@": "context",
  "~": "schedule",
  "|": "deadline",
  "": "category"
}
const tagTypes = Object.values(tagTypeByPrefix)

let priorityOrder = 0
const priorityLookup = {
  "!urgent": { color: "#FF0000", order: priorityOrder++ },
  "!soon": { color: "#FFFF00", order: priorityOrder++ },
  null: { color: "#0000FF", order: priorityOrder++ },
  "!backlog": { color: "#00FF00", order: priorityOrder++ },
  "!wishlist": { color: "#9400D3", order: priorityOrder++ },
}
const priorityTypes = Object.keys(priorityLookup)

const periodLookupMs = (() => {
  const hourly = 3600 * 1000
  const daily = hourly * 24
  const weekly = daily * 7
  const fortnightly = weekly * 2
  const monthly = 30.5 * daily
  const quarterly = 3 * monthly
  const yearly = 365.25 * daily
  return {
    hourly, daily, weekly, fortnightly, monthly, quarterly, yearly
  }
})()
const periodTypes = Object.keys(periodLookupMs)

/** Names of separately-stored data types in the model - one name for each tag type, plus "task" */
const storedDataTypes = [...tagTypes, "task"]
const listedDataTypes = [...storedDataTypes, "tag"]

function getTagContent(tagId) {
  const match = tagId.match(singleTagPattern)
  if (match) {
    const word = match[6]
    if (word) {
      return word
    }
    const phrase = match[4]
    if (phrase) {
      return phrase
    }
  }
  throw `Couldn't parse tagId ${tagId}`
}

/** Retrieve any "priority" tag from a task */
function getTaskPriority(task) {
  for (const tagId of filterTaskTagIdsByType(task, "priority")) {
    return tagId
  }
  return null
}

/**
 * Extracts periods from schedule tags 
 * @param {*} task Task containing zero or more tags prefixed by '~'
 * 
 */
function* iterateTaskPeriods(task) {
  for (const scheduleTag of filterTaskTagIdsByType(task, "schedule")) {
    const scheduleSuffix = scheduleTag.slice(1)
    const period = periodLookupMs[scheduleSuffix] //try to interpret as period
    if (period) {
      yield period
      continue
    }
    throw `Cannot parse ${scheduleTag} as a schedule tag`
  }
}

function getTaskShortestPeriod(task) {
  const periods = [...iterateTaskPeriods(task)]
  return periods.length ? _.sortBy(periods)[0] : null
}

function* iterateTaskDeadlines(task) {
  for (const deadlineTag of filterTaskTagIdsByType(task, "deadline")) {
    const deadlineContent = getTagContent(deadlineTag)
    const deadline = Date.parse(deadlineContent) //try to interpret as instant
    if (!isNaN(deadline)) {
      yield deadline
    }
    else {
      throw `Cannot parse ${deadlineTag} as a deadline tag`
    }
  }
}

function getNow() {
  return (new Date()).getTime()
}

/** Returns unix time for the instant the task is considered 
 * actionable (and is suitable for presentation in a todo list).
 * By default one-off or cyclic tasks are actionable this instant
 * After snoozing, the actionable instant is delayed until snooze.until
 * After fulfilment, a one-off task has a null actionable time
 * After fulfilment, a cyclic task is actionable exactly one period later.
 * @param {*} task 
 */
function whenTaskActionable(task) {
  const fulfils = [...filterTaskActionsByType(task, "fulfil")]
  const snoozes = [...filterTaskActionsByType(task, "snooze")]
  const lastFulfil = fulfils.length ? _.sortBy(fulfils, "instant").pop() : null
  const lastSnooze = snoozes.length ? _.sortBy(snoozes, "until").pop() : null
  const shortestPeriod = getTaskShortestPeriod(task)

  let actionable = null

  if (lastFulfil) { //was fulfilled at least once
    if (shortestPeriod) { //is periodic, will be actionable again
      actionable = lastFulfil.instant + shortestPeriod //one period after last fulfilment
    }
    else { //not periodic - won't be actionable again
      actionable = null
    }
  }
  else { //one off tasks are actionable immediately
    actionable = getNow()
  }

  if (actionable !== null && lastSnooze) { //an actionable time might be delayed by snooze
    actionable = Math.max(actionable, lastSnooze.until)
  }

  return actionable
}

function isTaskActionable(task, now = getNow()) {
  const actionable = whenTaskActionable(task)
  if (actionable) {
    return actionable <= now
  }
  return false
}

function isTaskClosed(task) {
  return whenTaskActionable(task) === null
}

function whenTaskDue(task) {
  const deadlines = [...iterateTaskDeadlines(task)]
  const soonestDeadline = deadlines.length ? _.sortBy(deadlines)[0] : null
  return soonestDeadline
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
function* iterateTaskTagIds(task) {
  if (Array.isArray(task.tagIds)) {
    for (let entry of task.tagIds) {
      yield entry
    }
  }
}

function* filterTaskTagIds(task, fn) {
  for (const tagId of iterateTaskTagIds(task)) {
    if (fn(tagId)) {
      yield tagId
    }
  }
}

function* filterTaskTagIdsByType(task, tagType) {
  yield* filterTaskTagIds(task, (tagId) => getTagType(tagId) === tagType)
}

function* iterateTaskActions(task) {
  if (Array.isArray(task.action)) {
    yield* task.action
  }
}

function* filterTaskActions(task, fn) {
  for (const action of iterateTaskActions(task)) {
    if (fn(action)) {
      yield action
    }
  }
}

function* filterTaskActionsByType(task, actionType) {
  yield* filterTaskActions(task, (action) => action.type === actionType)
}

/** Compares tasks by their actionable value */
function compareTaskActionable(taskA, taskB) {
  const instantA = whenTaskActionable(taskA)
  const instantB = whenTaskActionable(taskB)
  if (instantA && instantB) {
    //both actionable - compare them
    const now = getNow()
    const overrunA = now - instantA
    const overrunB = now - instantB
    const periodA = getTaskShortestPeriod(taskA)
    const periodB = getTaskShortestPeriod(taskB)
    if (periodA && periodB) {
      //normalise by period
      return (overrunB / periodB) - (overrunA / periodA)
    } else {
      return overrunB - overrunA
    }
  }
  else if (instantA) { //only instantA is actionable
    return -1
  }
  else if (instantB) { //only instantB is actionable
    return +1
  }
  else { //neither are actionable
    return 0
  }
}


/** Used to sort tasks ascending according to their "priority" tag (prefixed by !) */
function compareTaskPriority(taskA, taskB) {
  const priorityA = getTaskPriority(taskA)
  const priorityB = getTaskPriority(taskB)
  return priorityLookup[priorityA].order - priorityLookup[priorityB].order
}

const compareTaskOrder = jointComparatorFactory([
  compareTaskPriority,
  compareTaskActionable,
])

function orderNextTasks(series) {
  series = [...series]
  series.sort(compareTaskOrder)
  return series
}

function getFirstItem(series) {
  if (Array.isArray(series)) {
    if (series.length) {
      return series[0]
    }
  }
  else {
    for (const item of series) {
      return item
    }
  }
  return null
}

module.exports = {
  tagPrefixPattern,
  tagPhrasePattern,
  tagWordPattern,
  tagPattern,
  singleTagPattern,
  multipleTagPattern,
  tagTypeByPrefix,
  tagTypes,
  getTagType,
  storedDataTypes,
  listedDataTypes,
  priorityTypes,
  periodTypes,
  periodLookupMs,
  iterateTaskTagIds,
  iterateTaskPeriods,
  iterateTaskActions,
  iterateTaskDeadlines,
  getTaskShortestPeriod,
  compareTaskActionable,
  compareTaskPriority,
  compareTaskOrder,
  orderNextTasks,
  getFirstItem,
  getTagContent,
  getTaskPriority,
  whenTaskActionable,
  isTaskActionable,
  isTaskClosed,
  whenTaskDue,
  getNow,
}
