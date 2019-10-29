const fs = require("fs")
const path = require("path")
const refParser = require("json-schema-ref-parser")
const mergeAllOf = require("json-schema-merge-allof")
const { depthFirstWalk } = require("../../../lib/util/walk")

async function flattenSchema(schema) {
  schema = await refParser.bundle(schema) //dereferences $ref
  schema = mergeAllOf(schema) //merges allOf
  return schema
}

/**
 * Simplifies a schema for loading as a single JSON object
 * client-side by react-jsonschema-form with $ref and allOf references resolved
 * @param {*} typeName the type for which to simplify the schema
 */
async function editableSchema(typeName) {
  //load schema for this type
  const schemaPath = path.resolve(
    __dirname,
    `./json/${typeName}.schema.json`
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
  schema = await flattenSchema(schema)
  process.chdir(prevCwd)
  return schema
}

module.exports = {
  editableSchema,
}
