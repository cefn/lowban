const _ = require("lodash")
const { createMemoryDb } = require("./harness/lowdb")
const { iterateStoredTypes } = require("../../lib/tagmodel")
const { defaultTreeFactory, TagStore } = require("../../lib/tagstore")

function mockTagStore(tree) {
  const db = createMemoryDb(tree).defaultsDeep(defaultTreeFactory())
  return new TagStore(db)
}

test("Default data conforms to db structure", () => {
  const defaultTree = defaultTreeFactory()
  const typeNames = [...iterateStoredTypes()]
  for (const [typeName, typeCollection] of Object.entries(defaultTree)) {
    typeNames.includes(typeName)
    Array.isArray(typeCollection)
  }
})

test("lazyCreateTag populates tag when not in database", () => {
  const tagStore = mockTagStore({})
  const tag = tagStore.lazyCreateTag("!superimportant")
  expect(tag).toEqual({ id: "!superimportant" })
})

test("lazyCreateTag loads tag when found in database", () => {
  const storedTagRecord = {
    id: "!superimportant",
    title: "Level of Priority",
    content: "More detail if you needed"
  }
  const tagStore = mockTagStore({ priority: [storedTagRecord] })
  const tag = tagStore.lazyCreateTag("!superimportant")
  expect(tag).toEqual(storedTagRecord)
})

test("iterateAllTagIds includes ids from declared tags and transient tags", () => {
  const tagStore = mockTagStore({
    task: [
      {
        id: "0",
        title: "Name",
        tags:
          "transientWhat, !transientWhether, @transientWhere, #transientWhich"
      }
    ],
    category: [{ id: "what", title: "Some Category" }],
    priority: [{ id: "!whether", title: "Some Priority" }],
    context: [{ id: "@where", title: "Some Context" }],
    status: [{ id: "#which", title: "Some Status" }]
  })
  const tags = [...tagStore.iterateAllTagIds()]
  const actual = new Set(tags)
  const expected = new Set([
    "transientWhat",
    "!transientWhether",
    "@transientWhere",
    "#transientWhich",
    "what",
    "!whether",
    "@where",
    "#which"
  ])
  expect(actual).toEqual(expected)
})

test("iterateAllTags includes tags from declared tags and transient tags", () => {
  const tagStore = mockTagStore({
    task: [
      {
        id: "0",
        title: "Name",
        tags: "transientTag"
      }
    ],
    category: [{ id: "what", title: "Some Category" }],
    priority: [{ id: "!whether", title: "Some Priority" }],
    context: [{ id: "@where", title: "Some Context" }],
    status: [{ id: "#which", title: "Some Status" }]
  })
  const tags = [...tagStore.iterateAllTags()]
  const tagIds = _.map(tags, "id")
  for (const tagId of [
    "transientTag",
    "what",
    "!whether",
    "@where",
    "#which"
  ]) {
    expect(tagIds).toContain(tagId)
  }
})

test("iterateTaskTags retrieve a task's declared tags, constructs transient tags", () => {
  const tagStore = mockTagStore({
    task: [
      {
        id: "0",
        title: "Feed the Cat",
        content: "Leftover chicken in fridge",
        tags: "!critical, @home, cat, freshmeat"
      }
    ],
    category: [
      { id: "cat", title: "The Beast", content: "Our lovely cat, William" }
    ],
    priority: [{ id: "!critical", title: "Must Do" }],
    context: [{ id: "@home", title: "Stuff I can do in the house" }]
  })
  const task = tagStore.getById("task", "0")
  const tags = tagStore.iterateTaskTags(task)
  const actualSet = new Set(tags)
  const expectedSet = new Set([
    { id: "cat", title: "The Beast", content: "Our lovely cat, William" },
    { id: "!critical", title: "Must Do" },
    { id: "@home", title: "Stuff I can do in the house" },
    { id: "freshmeat" }
  ])
  expect(actualSet).toEqual(expectedSet)
})

test("createTagMap populates a map by ", () => {})
