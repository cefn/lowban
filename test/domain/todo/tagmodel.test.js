const _ = require("lodash")
const {
  tagPrefixPattern,
  tagPhrasePattern,
  tagWordPattern,
  tagPattern,
  singleTagPattern,
  multipleTagPattern,
  iterateStringTagIds,
  tagTypeByPrefix,
  tagTypes,
  getTagType,
  storedDataTypes,
  listedDataTypes,
  priorityTypes,
  priorityLookup,
  periodTypes,
  periodLookupMs,
  iterateTaskTagIds,
  iterateTaskPeriods,
  iterateTaskActions,
  iterateTaskDeadlines,
  getTaskShortestPeriod,
  compareTaskActionable,
  compareTaskPriority,
  compareTaskRelevant,
  relevantNextTasks,
  getFirstItem,
  getTagContent,
  getTaskPriority,
  whenTaskActionable,
  isTaskActionable,
  isTaskClosed,
  whenTaskDue,
  getNow,
} = require("../../../domain/todo/tagmodel")

const oneDayInMs = periodLookupMs["daily"]
const oneWeekInMs = periodLookupMs["weekly"]
const twoWeeksInMs = periodLookupMs["fortnightly"]
const fortyYearsInMs = 1262304000000

test("tagPrefixPattern matches all tag types", () => {
  const tagIdString = "!urgent @home #suspended ~weekly"
  expect(tagIdString.match(tagPrefixPattern).length).toBe(4)
})

test("tagWordPattern matches tags without delimiters", () => {
  const tagIdString = "!priority @context #status ~schedule category"
  expect(tagIdString.match(tagWordPattern).length).toBe(5)
})

test("tagPhrasePattern matches tags with delimiters", () => {
  // eslint-disable-next-line quotes
  const tagIdString = `!'priority phrase' @"context phrase" #'status phrase' ~'schedule phrase' 'category phrase'`
  const matches = tagIdString.match(tagPhrasePattern)
  expect(matches).toEqual([
    "'priority phrase'", "\"context phrase\"", "'status phrase'", "'schedule phrase'", "'category phrase'"
  ])
})

test("multipleTagPattern matches all styles of tag", () => {
  const tagIdString = "!urgent @'context phrase' #\"status phrase\" ~schedule category"
  const matches = tagIdString.match(multipleTagPattern)
  expect(matches).toEqual([
    "!urgent", "@'context phrase'", "#\"status phrase\"", "~schedule", "category"
  ])
})

test("iterateStringTagIds() can extract ids from space-separated string", () => {
  const stringTagIds = "mail @home !urgent ~'every thursday' |'next month' ok"
  expect([...iterateStringTagIds(stringTagIds)]).toEqual(["mail", "@home", "!urgent", "~'every thursday'", "|'next month'", "ok"])
})

test("iterateStringTagIds() behaves well with no matches", () => {
  const stringTagIds = ""
  expect([...iterateStringTagIds(stringTagIds)]).toEqual([])
})


test("getTagType() can identify all tag types", () => {
  for (const [tagPrefix, tagType] of Object.entries(tagTypeByPrefix)) {
    const tagId = `${tagPrefix}suffix`
    expect(getTagType(tagId)).toEqual(tagType)
  }
})

test("priorityTypes include priority tags and 'null' to handle when unspecified", () => {
  expect(priorityTypes).toEqual([
    "!urgent", "!soon", "null", "!backlog", "!wishlist"
  ])
})

test("getTagContent() handles plain and prefixed tags", () => {
  for (const [tagId, expectedContent] of Object.entries({
    "category": "category",
    "!priority": "priority",
    "@context": "context",
    "#status": "status",
    "~schedule": "schedule",
    "|deadline": "deadline"
  })) {
    const tagContent = getTagContent(tagId)
    expect(tagContent).toEqual(expectedContent)
  }
})

test("getTagContent() handles quoted tags", () => {
  for (const [tagId, expectedContent] of Object.entries({
    "!'a priority'": "a priority",
    "@'a context'": "a context",
    "#'a status'": "a status",
    "~'a schedule'": "a schedule",
    "|'a deadline'": "a deadline"
  })) {
    const tagContent = getTagContent(tagId)
    expect(tagContent).toEqual(expectedContent)
  }
})

test("getTagContent() throws for tag text not matching a single tag id", () => {
  const getInvalidTagContent = () => getTagContent("more than one word")
  expect(getInvalidTagContent).toThrow()
})


test("getTaskPriority() extracts first priority tag", () => {
  const task = { tagIds: ["!soon", "!urgent"] }
  expect(getTaskPriority(task)).toEqual("!soon")
})

test("iterateTaskPeriods() contains period in ms where Task contains periodic schedule tag", () => {
  for (const [periodName, periodMs] of Object.entries({
    hourly: 3600000,
    daily: 86400000,
    weekly: 604800000,
    fortnightly: 1209600000,
    monthly: 2635200000,
    quarterly: 7905600000,
    yearly: 31557600000
  })) {
    const task = { tagIds: [`~${periodName}`] }
    const periods = [...iterateTaskPeriods(task)]
    expect(periods).toContain(periodMs)
  }
})

test("iterateTaskPeriods() throws for Task with invalid schedule tag", () => {
  const task = { tagIds: ["~junk"] }
  const spreadPeriods = () => [...iterateTaskPeriods(task)]
  expect(spreadPeriods).toThrow()
})

test("iterateTaskDeadlines() throws for Task with invalid deadline tag", () => {
  const task = { tagIds: ["|'this is junk'"] }
  const spreadDeadlines = () => [...iterateTaskDeadlines(task)]
  expect(spreadDeadlines).toThrow()
})

test("iterateTaskDeadlines() extracts due time of deadline tag", () => {
  const task = { tagIds: ["|'Fri, 01 Jan 2010'"] }
  expect([...iterateTaskDeadlines(task)]).toEqual([1262304000000])
})

test("Period types include all values", () => {
  const periodTypesSet = new Set(periodTypes)
  const validateTypesSet = new Set([
    "hourly",
    "daily",
    "weekly",
    "fortnightly",
    "monthly",
    "quarterly",
    "yearly"
  ])
  expect(periodTypesSet).toEqual(validateTypesSet)
})

test.skip("iterateTaskPeriods() returns cycle duration for Tasks having ISO 8601 duration 'schedule' tag", () => {
  for (const durationString of ["P1Y", "P2M", "P3W", "P4D", "P1Y2M3W4DT05H06M07S"]) {
    const task = { tagIds: [`~${durationString}`] }
    expect(getTaskShortestPeriod(task)).toEqual(durationString)
  }
})

test("getNow() resolves to a Date", () => {
  expect(_.isInteger(getNow())).toBe(true)
})

test("whenTaskActionable() returns now by default", () => {
  const task = {}
  const minuteInMs = 60000
  const actionable = whenTaskActionable(task)
  const actionableMinute = ~~(actionable / minuteInMs)
  const now = getNow()
  const nowMinute = ~~(now / minuteInMs)
  expect(nowMinute).toEqual(actionableMinute)
})

test("whenTaskActionable() returns null if task is fulfilled and not periodic", () => {
  const task = { action: [{ type: "fulfil" }] }
  expect(whenTaskActionable(task)).toBeNull()
})

test("whenTaskActionable() last fulfil instant plus period if task periodic", () => {
  const fakeNow = 1568592130119
  const task = {
    tagIds: ["~weekly"],
    action: [
      {
        type: "fulfil",
        instant: fakeNow - (oneWeekInMs + oneDayInMs)
      }
    ]
  }
  const actionable = whenTaskActionable(task)
  expect(fakeNow - actionable).toEqual(oneDayInMs)
})

test("whenTaskActionable() delayed until snooze expiry", () => {
  const fakeNow = 1568592130119
  const task = {
    tagIds: ["~weekly"],
    action: [
      {
        type: "fulfil",
        instant: fakeNow - (oneWeekInMs + oneDayInMs)
      },
      {
        type: "snooze",
        instant: fakeNow - oneWeekInMs,
        until: fakeNow + twoWeeksInMs
      }
    ]
  }
  const actionable = whenTaskActionable(task)
  expect(actionable).toEqual(fakeNow + twoWeeksInMs)
})

test("isTaskActionable() returns false for task whose actionable time has not yet come", () => {
  const now = getNow()
  const task = { action: [{ type: "snooze", until: now + oneDayInMs }] }
  expect(isTaskActionable(task)).toBe(false)
})

test("isTaskActionable() returns true for task after snooze has expired", () => {
  const now = getNow()
  const task = { action: [{ type: "snooze", until: now - oneDayInMs }] }
  expect(isTaskActionable(task)).toBe(true)
})

test("isTaskActionable() returns false for task which has been fulfilled", () => {
  const task = { action: [{ type: "fulfil" }] }
  expect(isTaskActionable(task)).toBe(false)
})

test("isTaskActionable() returns false for fulfilled periodic task before period has passed", () => {
  const task = {
    tagIds: ["~daily"],
    action: [{ type: "fulfil", instant: getNow() - (0.5 * oneDayInMs) }]
  }
  expect(isTaskActionable(task)).toBe(false)
})

test("isTaskActionable() returns true for fulfilled periodic task after period has passed", () => {
  const task = {
    tagIds: ["~daily"],
    action: [{ type: "fulfil", instant: getNow() - (2 * oneDayInMs) }]
  }
  expect(isTaskActionable(task)).toBe(true)
})


test("isTaskClosed() returns true for fulfilled task if not periodic", () => {
  const task = { action: [{ type: "fulfil" }] }
  expect(isTaskClosed(task)).toBe(true)
})


test("whenTaskDue() returns null for Tasks without a deadline tag", () => {
  const task = {}
  const due = whenTaskDue(task)
  expect(due).toEqual(null) //a cycle time in milliseconds
})


test("whenTaskDue() calculates due time for Tasks having a 'deadline' tag", () => {
  const deadline = new Date(fortyYearsInMs) //midnight January 2010 (40 years since the epoch)
  for (const deadlineEncoding of [
    deadline.toISOString(), // 2010-01-01T00:00:00.000Z  ISO8601
    `'${deadline.toUTCString()}'`, //like 'Fri, 01 Jan 2010 00:00:00 GMT' RFC2822 
    `'${deadline.toLocaleString()}'`, //like '1/1/2010, 00:00:00' Javascript Locale-based representation
    "'Fri, 01 Jan 2010'"
  ]) {
    const task = { tagIds: [`|${deadlineEncoding}`] }
    const due = whenTaskDue(task)
    expect(due).toEqual(deadline.getTime()) //a cycle time in milliseconds
  }
})

test("Completed tasks (having no actionable instant) rank equally when compared by actionable status", () => {
  const taskA = { action: [{ type: "fulfil" }] }
  const taskB = { action: [{ type: "fulfil" }] }
  expect([taskA, taskB].sort(compareTaskActionable)).toEqual([taskA, taskB]) //order remains unchanged
  expect([taskB, taskA].sort(compareTaskActionable)).toEqual([taskB, taskA]) //order remains unchanged
})


test("Periodic tasks can be sorted by time since they were actionable", () => {
  const now = getNow()
  const instantA = now - (9 * oneDayInMs)
  const instantB = instantA - oneDayInMs //one day less overdue
  const taskA = {
    tagIds: ["~weekly"],
    action: [{ type: "fulfil", instant: instantA }]
  }
  const taskB = {
    tagIds: ["~weekly"],
    action: [{ type: "fulfil", instant: instantB }]
  }
  //most late should be first
  expect([taskA, taskB].sort(compareTaskActionable)).toEqual([taskB, taskA])
  expect([taskB, taskA].sort(compareTaskActionable)).toEqual([taskB, taskA])
})


test("Tasks with an actionable time (periodic tasks) are ranked before tasks with no actionable time (completed one-off tasks)", () => {
  const now = getNow()
  const instantA = now
  const instantB = now
  const taskA = {
    tagIds: [],
    action: [{ type: "fulfil", instant: instantA }]
  }
  const taskB = {
    tagIds: ["~weekly"],
    action: [{ type: "fulfil", instant: instantB }]
  }
  //periodic task should be first
  expect([taskA, taskB].sort(compareTaskActionable)).toEqual([taskB, taskA])
  expect([taskB, taskA].sort(compareTaskActionable)).toEqual([taskB, taskA])
})



test("A daily periodic task gets late quicker than a weekly task", () => {
  const now = getNow()
  const instantA = now - (9 * oneDayInMs)
  const instantB = instantA - oneDayInMs //one day more overdue
  const taskA = {
    tagIds: ["~daily"],
    action: [{ type: "fulfil", instant: instantA }]
  }
  const taskB = {
    tagIds: ["~weekly"],
    action: [{ type: "fulfil", instant: instantB }]
  }
  expect([taskA, taskB].sort(compareTaskActionable)).toEqual([taskA, taskB]) //most late first 
  expect([taskB, taskA].sort(compareTaskActionable)).toEqual([taskA, taskB]) //most late first 
})

test("Unfulfilled tasks with a snooze are ranked after unfulfilled tasks without", () => {
  const now = getNow()
  const taskA = {
    id: "a",
    action: [{ type: "snooze", instant: now - oneDayInMs, until: now + oneWeekInMs }]
  }
  const taskB = {
    id: "b"
  }
  //periodic task should be first
  expect([taskA, taskB].sort(compareTaskActionable)).toEqual([taskB, taskA])
  expect([taskB, taskA].sort(compareTaskActionable)).toEqual([taskB, taskA])
})


test("Tasks can be ordered by priority", () => {
  const urgentTask = { tagIds: ["!urgent"] }
  const nullTask = { tagIds: [] }
  const wishlistTask = { tagIds: ["!wishlist"] }
  const sortedTasks = [wishlistTask, nullTask, urgentTask].sort(compareTaskPriority)
  expect(sortedTasks).toEqual([urgentTask, nullTask, wishlistTask]) //most priority first
})

test("'Next' Tasks are jointly ordered by priority then age", () => {
  const now = getNow()
  const instantA = now - (9 * oneDayInMs)
  const instantB = instantA - oneDayInMs //one day more overdue
  const urgentTaskA = {
    tagIds: ["~weekly", "!urgent"],
    action: [{ type: "fulfil", instant: instantA }]
  }
  const urgentTaskB = {
    tagIds: ["~weekly", "!urgent"],
    action: [{ type: "fulfil", instant: instantB }]
  }
  const wishlistTaskA = {
    tagIds: ["~weekly", "!wishlist"],
    action: [{ type: "fulfil", instant: instantA }]
  }
  const wishlistTaskB = {
    tagIds: ["~weekly", "!wishlist"],
    action: [{ type: "fulfil", instant: instantB }]
  }
  const originalTaskList = [wishlistTaskA, wishlistTaskB, urgentTaskA, urgentTaskB]
  const sortedTasks = relevantNextTasks(originalTaskList)
  expect(sortedTasks).toEqual([urgentTaskB, urgentTaskA, wishlistTaskB, wishlistTaskA]) //most priority first, then most late
})

test("getFirstItem() returns null for empty array", () => {
  expect(getFirstItem([])).toEqual(null)
})

test("getFirstItem() gets first element from array", () => {
  expect(getFirstItem([5, 4, 3])).toEqual(5)
})

test("getFirstItem() returns null for empty generator", () => {
  // eslint-disable-next-line require-yield
  function* generateSequence() { return }
  expect(getFirstItem(generateSequence())).toEqual(null)
})

test("getFirstItem() gets first element from generator", () => {
  function* generateSequence() {
    yield 5
    yield 4
    yield 3
  }
  expect(getFirstItem(generateSequence())).toEqual(5)
})



// test("", () => {
// })

// test("", () => {
// })

// test("", () => {
// })