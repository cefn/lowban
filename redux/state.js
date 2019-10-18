import { storedDataTypes } from "../lib/tagmodel"

const defaultState = {
  types: [...storedDataTypes], //list of types
  schemas: {}, //schemas by type
  ids: {}, //id lists by type
  //rows mapped by type, then by id (as defined by normalizr)
  rows: Object.assign({}, ...storedDataTypes.map(typeName => ({ [typeName]: [] }))),
  focusType: null, //the row type in focus
  focusId: null, //the row id in focus
}

function getRowPath(type, id) {
  return `rows.${type}.${id}`
}

function getSchemaPath(type) {
  return `schemas.${type}`
}

module.exports = {
  defaultState,
  getRowPath,
  getSchemaPath,
}
