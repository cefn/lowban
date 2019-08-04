test("tagTypeByPrefix has priority type", () => {
  const { tagTypeByPrefix } = require("../../lib/tagmodel")
  expect(tagTypeByPrefix["!"]).toEqual("priority")
})

test("tagTypeByPrefix has fallback type", () => {
  const { tagTypeByPrefix } = require("../../lib/tagmodel")
  expect(tagTypeByPrefix[""]).toEqual("category")
})

test("getTagTypes() lists all types", () => {
  const { getTagTypes } = require("../../lib/tagmodel")
  expect(getTagTypes()).toEqual(["priority", "status", "context", "category"])
})

test("getTagType() inspects tag first character for type", () => {
  const { getTagType } = require("../../lib/tagmodel")
  const urgentTag = "!urgent"
  expect(getTagType(urgentTag)).toEqual("priority")
})

test("getTaskTagIds() splits tags property of task object", () => {
  const task = {
    tags: ["!urgent,@home, #done ,housework"]
  }
  expect(getTaskTagIds(task)).toEqual([
    "!urgent",
    "@home",
    "#done",
    "housework"
  ])
})
