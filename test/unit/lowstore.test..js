const { createDb, deleteDb, parseDb } = require("../lib/dbscaffold")
const { loadDb, LowStore } = require("../../lib/lowstore")

beforeAll(() => {
  deleteDb()
})

test("Queries load values from db file", () => {
  let db = createDb({ fieldName: "fieldValue" })
  expect(db.get("fieldName").value()).toEqual("fieldValue")
})

test("Lodash transformation chain followed by write is reflected in db file", () => {
  let db = createDb({ fieldName: "fieldValue" })
  db.set("fieldName", "otherValue").write()
  expect(parseDb()).toEqual({ fieldName: "otherValue" })
})

test("entitiesByType lists entities of a type", () => {
  let db = createDb({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  let store = LowStore(db)
  let songs = store.entitiesByType("song")
  expect(songs).toEqual([
    { id: "0", title: "Baby Shark" },
    { id: "1", title: "Raining Tacos" }
  ])
})

test("entityResolverFactory creates GraphQL resolver listing entities for a type", () => {
  const db = createDb({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  const store = LowStore(db)
  const resolver = store.entityResolverFactory("song")
  const { parent, args, context, info } = {} //all deliberately undefined
  const songs = resolver(parent, args, context, info)
  expect(songs).toEqual([
    { id: "0", title: "Baby Shark" },
    { id: "1", title: "Raining Tacos" }
  ])
})

test("entityById can retrieve a single typed entity", () => {
  let db = createDb({
    song: [
      { id: "0", title: "Baby Shark" },
      { id: "1", title: "Raining Tacos" }
    ]
  })
  let store = LowStore(db)
  let song = store.entityById("song", "1")
  expect(song).toEqual({ id: "1", title: "Raining Tacos" })
})
