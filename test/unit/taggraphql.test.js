"use strict"
const { createMemoryDb } = require("./harness/lowdb")
const { graphql } = require("graphql")
const { TagStore, defaultTreeFactory } = require("../../lib/tagstore")
const { schemaFactory } = require("../../lib/taggraphql")

function mockTagStore(mockTree) {
  const dbTree = {}
  Object.assign(dbTree, defaultTreeFactory()) //populate default entity arrays
  Object.assign(dbTree, mockTree) //overwrite where entity arrays provided by tree
  return new TagStore(createMemoryDb(dbTree))
}

function createSchemaFromTree(tree) {
  return schemaFactory(mockTagStore(tree))
}

async function getGraphQlResponse(schema, request, swallowErrors = false) {
  const response = await graphql(schema, request)
  //workaround for GraphQL swallowing all errors from backing datastore
  if (!swallowErrors) {
    if (response.errors) {
      for (let error of response.errors) {
        if (error.originalError) {
          throw error.originalError
        } else {
          throw error
        }
      }
    }
  }
  return response
}

test("Schema can list both referenced and declared tags ", async () => {
  const schema = createSchemaFromTree({
    task: [{ id: "0", tags: "@home,#done" }],
    tags: [{ id: "@home", title: "Can be done in the house" }]
  })
  const request = `{ tag { id } }`
  const response = await getGraphQlResponse(schema, request)
  const actual = new Set(response.data.tag)
  const expected = new Set([{ id: "@home" }, { id: "#done" }])
  expect(actual).toEqual(expected)
})
