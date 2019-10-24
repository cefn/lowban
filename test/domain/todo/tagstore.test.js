const _ = require("lodash")
const { dbInMemory } = require("../../../lib/lowstore")
const {
  storedDataTypes,
  listedDataTypes
} = require("../../../domain/todo/tagmodel")
const { createDefaultTree, TagStore } = require("../../../domain/todo/tagstore")

function mockTagStore(tree) {
  if (!tree) {
    tree = createDefaultTree()
  }
  const db = dbInMemory(tree)
  return new TagStore(db)
}

test("Default data conforms to db structure", () => {
  const defaultTree = createDefaultTree()
  for (const [typeName, typeCollection] of Object.entries(defaultTree)) {
    storedDataTypes.includes(typeName)
    Array.isArray(typeCollection)
  }
})

test("tags are traversable even though not stored", () => {
  expect(_.difference(listedDataTypes, storedDataTypes)).toEqual(["tag"])
})

test("lazyCreateTag populates tag when not in database", () => {
  const tagStore = mockTagStore({})
  const tag = tagStore.lazyCreateTag("!superimportant")
  expect(tag).toEqual({ id: "!superimportant" })
})

test("lazyCreateTag loads tag when found in database", () => {
  const storedTagRecord = {
    id: "!superimportant",
    label: "Level of Priority",
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
        label: "Name",
        tagIds: [
          "transientWhat",
          "!transientWhether",
          "@transientWhere",
          "#transientWhich"
        ]
      }
    ],
    category: [{ id: "what", label: "Some Category" }],
    priority: [{ id: "!whether", label: "Some Priority" }],
    context: [{ id: "@where", label: "Some Context" }],
    status: [{ id: "#which", label: "Some Status" }]
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

test("iterateAllTagIds() reports each tag only once", () => {
  const tagStore = mockTagStore({
    task: [{ id: "0", tagIds: ["this", "that"] }, { id: "1", tagIds: "this" }],
    category: [{ id: "that" }]
  })
  const tagIds = [...tagStore.iterateAllTagIds()]
  expect(tagIds).toContain("this")
  expect(tagIds).toContain("that")
  expect(tagIds.length).toEqual(2)
})

test("iterateAllTags includes tags from declared tags and transient tags", () => {
  const tagStore = mockTagStore({
    task: [
      {
        id: "0",
        label: "Name",
        tagIds: ["transientTag"]
      }
    ],
    category: [{ id: "what", label: "Some Category" }],
    priority: [{ id: "!whether", label: "Some Priority" }],
    context: [{ id: "@where", label: "Some Context" }],
    status: [{ id: "#which", label: "Some Status" }]
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
        label: "Feed the Cat",
        content: "Leftover chicken in fridge",
        tagIds: ["!urgent", "@home", "cat", "freshmeat"]
      }
    ],
    category: [
      { id: "cat", label: "The Beast", content: "Our lovely cat, William" }
    ],
    priority: [{ id: "!urgent", label: "Must Do" }],
    context: [{ id: "@home", label: "Stuff I can do in the house" }]
  })
  const task = tagStore.getById("task", "0")
  const tags = tagStore.iterateTaskTags(task)
  const actualSet = new Set(tags)
  const expectedSet = new Set([
    { id: "cat", label: "The Beast", content: "Our lovely cat, William" },
    { id: "!urgent", label: "Must Do" },
    { id: "@home", label: "Stuff I can do in the house" },
    { id: "freshmeat" }
  ])
  expect(actualSet).toEqual(expectedSet)
})

test("iterateFilteredTasks() returns tasks with tag matches", () => {
  const tagStore = mockTagStore({
    task: [
      {
        id: "cat",
        label: "Feed the Cat",
        tagIds: ["!urgent", "@home", "cat"]
      }
    ],
  })
  expect([...tagStore.iterateFilteredTasks("cat")].map((task) => task.id)).toEqual(["cat"])
  expect([...tagStore.iterateFilteredTasks("home")].map((task) => task.id)).toEqual(["cat"])
  expect([...tagStore.iterateFilteredTasks("urgent")].map((task) => task.id)).toEqual(["cat"])
  expect([...tagStore.iterateFilteredTasks("@home")].map((task) => task.id)).toEqual(["cat"])
  expect([...tagStore.iterateFilteredTasks("!urgent")].map((task) => task.id)).toEqual(["cat"])
})

test("iterateFilteredTasks() returns tasks by case-insensitive content match", () => {
  const tagStore = mockTagStore({
    task: [
      { id: "cat", label: "Give dry food to William", tagIds: ["!urgent", "@home", "cat"] },
      { id: "dog", label: "Give canned food to Rover", tagIds: ["@home", "dog"] }
    ],
  })
  expect([...tagStore.iterateFilteredTasks("give")].map((task) => task.id)).toEqual(["cat", "dog"])
  expect([...tagStore.iterateFilteredTasks("food")].map((task) => task.id)).toEqual(["cat", "dog"])
  expect([...tagStore.iterateFilteredTasks("dry")].map((task) => task.id)).toEqual(["cat"])
  expect([...tagStore.iterateFilteredTasks("canned")].map((task) => task.id)).toEqual(["dog"])
})


test("iterateFilteredTasks() treats terms with tag prefixes as tags only ", () => {
  const tagStore = mockTagStore({
    task: [
      { id: "cat", label: "Give dry food to William", tagIds: ["!urgent", "@home", "cat"] },
      { id: "dog", label: "Give canned food to Rover with tag !urgent", tagIds: ["@home", "dog"] }
    ],
  })
  expect([...tagStore.iterateFilteredTasks("urgent")].map((task) => task.id)).toEqual(["cat", "dog"])
  expect([...tagStore.iterateFilteredTasks("!urgent")].map((task) => task.id)).toEqual(["cat"])
})

test("randomItem() returns sampled item", () => {
  const tagStore = mockTagStore({
    task: [
      { id: "cat", label: "SameLabel" },
      { id: "dog", label: "SameLabel" }
    ],
    category: [{ id: "garden", label: "Stuff for the yard" }],
    status: [],
  })
  const sampledTask = tagStore.randomItem("task")
  expect(sampledTask).toHaveProperty("label")
  expect(sampledTask.label).toBe("SameLabel")

  const sampledCategory = tagStore.randomItem("category")
  expect(sampledCategory.id).toBe("garden")

  const sampledStatus = tagStore.randomItem("status")
  expect(sampledStatus).toBe(null)

})

test("iterateFilteredTags() returns tags with id matching search term", () => {
  const tagStore = mockTagStore({
    task: [
      { id: "cat", label: "Give dry food to William", tagIds: ["!urgent", "@home", "cat"] },
    ],
    category: [{ id: "cat", label: "Stuff for William" }]
  })
  expect([...tagStore.iterateFilteredTags("cat")].map((tag) => tag.label)).toEqual(["Stuff for William"])
  expect([...tagStore.iterateFilteredTags("ome")].map((tag) => tag.id)).toEqual(["@home"])
})


// test("iterateActionableTasks() excludes one-time tasks containing a fulfil action", () => {
//   const tagStore = mockTagStore({
//     task: [
//       {
//         label: "Done",
//         action: [
//           { type: "fulfil" }
//         ]
//       },
//       { label: "Undone" },
//     ]
//   })
//   const actual = [...tagStore.iterateActionableTasks()]
//   const expected = [{ label: "Undone" }]
//   expect(actual).toEqual(expected)
// })