/** BEGIN TMP workaround to have a shared field list for GraphQL schema clients
 * TODO should be derived from schema files 
 * TODO should be used to construct graphql schema
 * TODO should be hoisted into config */
const itemSchema = {
  label: "string",
  note: "string",
  id: "string",
}

const schemaMap = {
  "task": { //force ordering by not using spread of itemSchema
    label: "string",
    note: "string",
    tagIds: "array",
    id: "string",
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
  filterTags: "tag",
  tasksByRelevant: "task",
  tasksByTime: "task",
  tasksFulfilled: "task",
}

const propertyNames = {}
for (const type of Object.keys(schemaMap)) {
  propertyNames[type] = Object.keys(schemaMap[type])
}

function getPropertyNames(itemType) {
  return propertyNames[itemType]
}

function getListType(listName) {
  return listMap[listName]
}

module.exports = {
  getPropertyNames,
  getListType,
}

/** END TMP */
