"use strict"
const { getLocalResponse } = require("../../lib/util/graphql")
const { dbInMemory } = require("../../lib/lowstore")
const { createDefaultTree, TagStore } = require("../../domain/todo/tagstore")
const { schemaFactory } = require("../../domain/todo/schema/graphql")

function createMockTagStore(mockTree) {
  const db = dbInMemory(createDefaultTree()) //initialise db
  db.defaultsDeep(mockTree).write() //overwrite values for test
  return new TagStore(db)
}

function createSchemaFromTree(tree) {
  return schemaFactory(createMockTagStore(tree))
}

test("Schema can list both referenced and declared tags ", async () => {
  const schema = createSchemaFromTree({
    task: [{ id: "0", tagIds: ["@home", "#done"] }],
    tags: [{ id: "@home", title: "Can be done in the house" }]
  })
  const request = "{ tagList { id } }"
  const response = await getLocalResponse(schema, request)
  const records = response.data.tagList
  const actual = new Set(records)
  const expected = new Set([{ id: "@home" }, { id: "#done" }])
  expect(actual).toEqual(expected)
})
