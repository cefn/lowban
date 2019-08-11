const Memory = require("lowdb/adapters/Memory")
const {
  createFileDb,
  deleteFileDb,
  parseFileDb,
  createMemoryDb
} = require("./harness/lowdb")
const { loadDb, LowStore } = require("../../lib/lowstore")

function mockLowStore(tree) {
  const db = createMemoryDb(tree)
  return new LowStore(db)
}

test("Lodash transformation chain followed by write is reflected in db file", () => {
  const db = createFileDb({ fieldName: "fieldValue" })
  db.set("fieldName", "otherValue").write()
  expect(parseFileDb()).toEqual({ fieldName: "otherValue" })
  deleteFileDb()
})

test("entitiesByType lists entities of a type", () => {
  const store = mockLowStore({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  const songs = store.iterateByType("song")
  expect([...songs]).toEqual([
    { id: "0", title: "Baby Shark" },
    { id: "1", title: "Raining Tacos" }
  ])
})

test("entityResolverFactory creates GraphQL resolver listing entities for a type", () => {
  const store = mockLowStore({
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
  const store = mockLowStore({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  let song = store.getById("song", "1")
  expect(song).toEqual({ id: "1", title: "Raining Tacos" })
})
