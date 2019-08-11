const {
  tagTypeByPrefix,
  getTagType,
  getTagTypes,
  getTaskTagIds
} = require("../../lib/tagmodel")

test("getTagTypes() lists all types", () => {
  expect(getTagTypes()).toEqual(["priority", "status", "context", "category"])
})

test("getTagType() can identify priority tags", () => {
  expect(getTagType("!urgent")).toEqual("priority")
})

test("getTagType() can identify status tags", () => {
  expect(getTagType("#done")).toEqual("status")
})

test("getTagType() can identify context tags", () => {
  expect(getTagType("@office")).toEqual("context")
})

test("getTagType() falls back to default 'category' tag type", () => {
  expect(getTagType("pets")).toEqual("category")
  expect(getTagType("*random")).toEqual("category")
})

test("getTaskTagIds() splits tags property of task object", () => {
  const task = {
    tags: "!urgent,@home, #done ,housework"
  }
  const result = getTaskTagIds(task)
  expect([...result]).toEqual(["!urgent", "@home", "#done", "housework"])
})
