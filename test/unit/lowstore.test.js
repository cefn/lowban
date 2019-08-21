const { readFileSync, unlinkSync } = require("fs")
const Memory = require("lowdb/adapters/Memory")
const { dbFromPath, dbInMemory, LowStore } = require("../../lib/lowstore")

const defaultDbPath = "/tmp/db.json"

function createTestDb(tree, testDbPath = defaultDbPath) {
  return dbFromPath(testDbPath, tree)
}

function createTestLowStore(tree, testDbPath = defaultDbPath) {
  const db = createTestDb(tree, testDbPath)
  return new LowStore(db)
}

function createMockLowStore(tree) {
  const db = dbInMemory(tree)
  return new LowStore(db)
}

/** Remove db JSON file from disk */
function deleteTestDb(testDbPath = defaultDbPath) {
  unlinkSync(testDbPath)
}

/** Parse the JSON file direct from disk without lowstore */
function parseTestDb(testDbPath = defaultDbPath) {
  return JSON.parse(readFileSync(testDbPath, "utf-8"))
}

test("Lowdb operations followed by write are reflected in db file", () => {
  try {
    const db = createTestDb({ fieldName: "fieldValue" })
    db.set("fieldName", "otherValue").write()
    const actual = parseTestDb()
    const expected = { fieldName: "otherValue" }
    expect(actual).toEqual(expected)
  } finally {
    deleteTestDb()
  }
})

test("LowStore changes to a table are reflected in db file", () => {
  try {
    const store = createTestLowStore({
      exampleType: [{ exampleField: "initialValue" }]
    })
    store.changeTable("exampleType", table => {
      return table.updateWhere(
        { exampleField: "initialValue" },
        { exampleField: "finalValue" }
      )
    })
    expect(parseTestDb()).toEqual({
      exampleType: [{ exampleField: "finalValue" }]
    })
  } finally {
    deleteTestDb()
  }
})

test("iterateByType lists entities of a type", () => {
  const store = createMockLowStore({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  const songList = [...store.iterateByType("song")]
  expect(songList).toEqual([
    { id: "0", title: "Baby Shark" },
    { id: "1", title: "Raining Tacos" }
  ])
})

test("iterateByType throws where top level collections are not arrays", () => {
  const lowStore = createMockLowStore({
    item: { mockedId: { title: "My ancestor should be an array not a map" } }
  })
  expect(() => {
    const items = [...lowStore.iterateByType("item")]
  }).toThrow()
})

test("entityResolverFactory creates GraphQL resolver listing entities for a type", () => {
  const store = createMockLowStore({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  const resolver = store.entityResolverFactory("song")
  const { parent, args, context, info } = {} //all deliberately undefined
  const songs = resolver(parent, args, context, info)
  expect([...songs]).toEqual([
    { id: "0", title: "Baby Shark" },
    { id: "1", title: "Raining Tacos" }
  ])
})

test("getById can retrieve a single typed entity", () => {
  const store = createMockLowStore({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  let song = store.getById("song", "1")
  expect(song).toEqual({ id: "1", title: "Raining Tacos" })
})
