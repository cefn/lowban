const fs = require("fs")
const path = require("path")
const _ = require("lodash")
const refParser = require("json-schema-ref-parser")
const mergeAllOf = require("json-schema-merge-allof")
const { depthFirstWalk } = require("./tree")

async function simplifySchema(schema) {
  schema = await refParser.bundle(schema) //dereferences $ref
  schema = mergeAllOf(schema) //merges allOf
  return schema
}

async function editableSchema(typeName) {
  //load schema for this type
  const schemaPath = path.resolve(
    __dirname,
    `../../schema/${typeName}.schema.json`
  )
  let schema = JSON.parse(fs.readFileSync(schemaPath))
  //rewrite schema to allow space-separated tag ids
  const listRef = "tagged.schema.json#/definitions/tagIdsList"
  const stringRef = "tagged.schema.json#/definitions/tagIdsString"
  depthFirstWalk(schema, (key, value, parent) => {
    if (key == "$ref" && value.endsWith(listRef)) {
      parent[key] = value.replace(listRef, stringRef)
    }
  })
  //resolve $ref entries against directory containing the schema
  const prevCwd = process.cwd()
  process.chdir(path.dirname(schemaPath))
  schema = await simplifySchema(schema)
  process.chdir(prevCwd)
  return schema
}

function editableData(data) {
  data = _.cloneDeep(data)
  if ("tagIds" in data) {
    data.tagIds = data.tagIds.join(" ")
  }
  return data
}

function storableData(data) {
  data = _.cloneDeep(data)
  if ("tagIds" in data) {
    data.tagIds = data.tagIds.split(" ")
  }
  return data
}

module.exports = {
  editableSchema,
  editableData,
  storableData
}
