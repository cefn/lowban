const { storedDataTypes } = require("../tagmodel")

const defaultState = {
  types: [...storedDataTypes], //list of types
  schemas: {}, //schemas by type
  //rows mapped by type, then by id (as defined by normalizr)
  rows: Object.assign({}, ...storedDataTypes.map(typeName => ({ [typeName]: [] }))),
  lists: {}, // lists by type, listname
  focusType: null, //the row type in focus
  focusId: null, //the row id in focus
  focusString: "", //the string filtering views
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

function focusSelector(state) {
  return [state.focusType, state.focusId]
}

module.exports = {
  defaultState,
  getRowPath,
  getSchemaPath,
  getListPath,
  focusSelector
}
