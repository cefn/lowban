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
  "status": { ...itemSchema },
  "tag": { ...itemSchema },
}

const listMap = {
  filterTask: "task",
  filterTag: "tag",
}

function getPropertyNames(itemType) {
  return Object.keys(schemaMap[itemType])
}

function getListType(listName) {
  return listMap[listName]
}

module.exports = {
  getPropertyNames,
  getListType,
}

/** END TMP */
