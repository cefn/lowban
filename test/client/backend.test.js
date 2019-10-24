const backend = require("../../client/backend")

const { launchServer } = require("../../server")
const { dbInMemory } = require("../../lib/lowstore")
const { createDefaultTree } = require("../../domain/todo/tagstore")

function mockDb(tree) {
  if (!tree) {
    tree = createDefaultTree()
  }
  return dbInMemory(tree)
}

function withServerStore(...args) {
  //intepret arguments
  let tree, fn
  if (args.length == 1) { //handle single arg as fn (tree undefined)
    [fn] = args
    tree = undefined
  }
  else {
    [tree, fn] = args
  }

  //launch the server, pass server's store to fn(), close the server
  return async () => {
    let handle = null, store = null
    try {
      const db = mockDb(tree)
        ;[handle, store] = launchServer(db)
      return await fn(store)
    }
    finally {
      if (handle) handle.close()
    }
  }
}

it("Can load a schema", withServerStore(async () => {
  const taskSchema = await backend.loadSchema("task")
  expect(taskSchema).toHaveProperty("$id", "https://github.com/cefn/lowban/tree/v0.2.0/domain/todo/schema/task.schema.json")
}))

it("Can list ids by item type", withServerStore(
  { task: [{ id: "a" }, { id: "b" }, { id: "c" }] },
  async () => {
    const itemType = "task"
    const ids = await backend.loadIds(itemType)
    expect(ids).toEqual(["a", "b", "c"])
  }
))

it("Can load an item by type and id", withServerStore(
  { task: [{ id: "a", label: "Ape" }, { id: "b", label: "Bee" }, { id: "c", label: "Cat" }] },
  async () => {
    const itemType = "task"
    const itemId = "b"
    const item = await backend.loadItem(itemType, itemId)
    expect(item.label).toEqual("Bee")
  }
))

it("Can save item by type, attaching id", withServerStore(async (db) => {
  const itemType = "task"
  const sentItem = { label: "Zebra" }
  const receivedItem = await backend.saveItem(itemType, sentItem)
  const receivedId = receivedItem.id
  //id was assigned to record by server
  expect(receivedId).not.toBeNull()
  //remaining fields were returned in server response (TODO check for all fields in type?)
  expect(receivedItem.label).toBe("Zebra")
  //record was actually stored in DB
  const record = db.queryTable("task", table => table.getById(receivedId))
  expect(record.label).toBe("Zebra")
}))


