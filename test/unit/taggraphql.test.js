"use strict"
const { createMemoryDb } = require("./harness/lowdb")
const { getLocalResponse } = require("../../lib/util/graphql")
const { TagStore, defaultTreeFactory } = require("../../lib/tagstore")
const { schemaFactory } = require("../../lib/taggraphql")

function mockTagStore(mockTree) {
  const dbTree = {}
  Object.assign(dbTree, defaultTreeFactory()) //initialise default tree
  Object.assign(dbTree, mockTree) //overwrite with mock values
  return new TagStore(createMemoryDb(dbTree))
}

function createSchemaFromTree(tree) {
  return schemaFactory(mockTagStore(tree))
}

test("Schema can list both referenced and declared tags ", async () => {
  const schema = createSchemaFromTree({
    task: [{ id: "0", tagIds: ["@home", "#done"] }],
    tags: [{ id: "@home", title: "Can be done in the house" }]
  })
  const request = `{ tagList { id } }`
  const response = await getLocalResponse(schema, request)
  const records = response.data.tagList
  const actual = new Set(records)
  const expected = new Set([{ id: "@home" }, { id: "#done" }])
  expect(actual).toEqual(expected)
})
