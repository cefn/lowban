const fs = require("fs")
const path = require("path")
const _ = require("lodash")
const refParser = require("json-schema-ref-parser")
const mergeAllOf = require("json-schema-merge-allof")
const { depthFirstWalk } = require("./walk")

const { domain: defaultDomain } = require("../../defaults")

/** BEGIN TMP workaround to have a shared field list for GraphQL schema clients
 * TODO should be derived from schema files 
 * TODO should be used to construct graphql schema
 * TODO should be hoisted into config */
const itemSchema = {
  id: "string",
  label: "string",
  note: "string",
}

const schemaMap = {
  "task": {
    ...itemSchema,
    tagIds: "array"
  },
  "category": { ...itemSchema },
  "priority": { ...itemSchema },
  "schedule": { ...itemSchema },
  "deadline": { ...itemSchema },
  "context": { ...itemSchema },
  "status": { ...itemSchema }
}
/** END TMP */

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
async function editableSchema(typeName, domain = defaultDomain) {
  //load schema for this type
  const schemaPath = path.resolve(
    __dirname,
    `../../domain/${domain}/schema/${typeName}.schema.json`
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

function getPropertyNames(itemType) {
  return Object.keys(schemaMap[itemType])
}

/** Serves an editableSchema JSON schema version for the type passed as req.params.typeName */
async function editableSchemaMiddleware(req, res, _next) {
  const schema = await editableSchema(req.params.typeName, req.params.domain)
  res.json(schema)
}

module.exports = {
  editableSchema,
  editableSchemaMiddleware,
  getPropertyNames
}
