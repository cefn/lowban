const { storedDataTypes } = require("../tagmodel")

const defaultState = {
  types: [...storedDataTypes], //list of types
  schemas: {}, //schemas by type
  //rows mapped by type, then by id (as defined by normalizr)
  rows: Object.assign({}, ...storedDataTypes.map(typeName => ({ [typeName]: [] }))),
  lists: {}, // lists by type, listname
  taskFilterString: "", //affects task list
  tagFilterString: "", //affects tag list
  editor: {
    type: "task",
    id: undefined,
    item: undefined,
  }
}

function getRowPath(type, id) {
  return `rows.${type}.${id}`
}

function getSchemaPath(type) {
  return `schemas.${type}`
}

function getListPath(name) {
  return `lists.${name}`
}

module.exports = {
  defaultState,
  getRowPath,
  getSchemaPath,
  getListPath,
}
