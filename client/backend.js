const nodeFetch = require("node-fetch")
const { getRemoteResponse } = require("../lib/util/graphql")
const { initialCapital } = require("../lib/util/javascript")
const { getPropertyNames } = require("../domain/todo/schema/fields")
const { storableData, editableData } = require("../domain/todo/schema/form")

function createBackend(host) {

  const graphqlEndpoint = `${host}/graphql`

  async function getFromPath(path) {
    const url = `${host}/${path}`
    const req = {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
    }
    const res = await nodeFetch(url, req)
    return res.json()
  }

  async function loadSchema(itemType) {
    const schema = getFromPath(`schema/${itemType}`)
    return schema
  }

  //TODO implement itemTypes retriever via store and corresponding saga (instead of hard-coded values in defaultState)
  /*
  async function loadItemTypes() {
    return await getRemoteResponse(graphqlEndpoint, )
  }
  */

  async function loadIds(itemType) {
    const query = `{ ids(type: "${itemType}") } `
    const response = await getRemoteResponse(graphqlEndpoint, query)
    return response.data.ids
  }

  async function loadItem(itemType, itemId) {
    const resolverName = itemType
    const query = `{
      ${ resolverName} (id: "${itemId}"){
        ${ getPropertyNames(itemType).join(" ")}
      }
    } `
    const response = await getRemoteResponse(graphqlEndpoint, query)
    const item = response.data[resolverName]
    return editableData(item)
  }

  async function loadList(listName, listArgs, listFields) {
    const resolverName = listName
    //TODO promote query argument serialisation into graphql util
    const resolverArgs = (!listArgs) ? "" : `(${
      Object.entries(listArgs).map(
        ([name, value]) => `${name}:${JSON.stringify(value)}`
      ).join(",")
    })`
    const resolverFields = listFields.join(" ")
    const query = `{ ${resolverName}${resolverArgs} { ${resolverFields} } }`
    const response = await getRemoteResponse(graphqlEndpoint, query)
    return response.data[resolverName]
  }

  async function saveItem(itemType, item) {
    //TODO use common implementation for arg-based saving mutations AND loading queries ^^^
    const sent = storableData(item) //make schema-compliant
    let variables = { sent }
    let resolverName = `${itemType}Merge`
    let inputSpec = `${initialCapital(itemType)}Input!`
    let query = `mutation ($sent:${inputSpec}){
      ${resolverName}(input:$sent){
        ${ getPropertyNames(itemType).join(" ")}
      }
    }`
    const response = await getRemoteResponse(graphqlEndpoint, query, variables)
    const received = response.data[resolverName]
    return editableData(received) //make form-compliant
  }

  async function removeItem(type, id) {
    const resolverName = "itemRemove"
    let query = `mutation {
      ${resolverName}(type:${JSON.stringify(type)},id:${JSON.stringify(id)})
    }`
    const response = await getRemoteResponse(graphqlEndpoint, query)
    const removed = response.data[resolverName]
    return removed
  }

  //TODO add implicit 'create' action when id is assigned by database

  async function snoozeTask(id, until) {
    const resolverName = "taskSnooze"
    let query = `mutation {
      ${resolverName}(id:${JSON.stringify(id)},until:${JSON.stringify(until)}){
        id
      }
    }`
    const response = await getRemoteResponse(graphqlEndpoint, query)
    const received = response.data[resolverName]
    return received.id === id
  }

  async function fulfilTask(id) {
    //TODO eliminate boilerplate with snoozeTask and others
    const resolverName = "taskFulfil"
    let query = `mutation {
      ${resolverName}(id:${JSON.stringify(id)}){
        id
      }
    }`
    const response = await getRemoteResponse(graphqlEndpoint, query)
    const received = response.data[resolverName]
    return received.id === id
  }

  return {
    loadSchema,
    loadIds,
    loadItem,
    loadList,
    saveItem,
    removeItem,
    snoozeTask,
    fulfilTask,
  }

}

module.exports = {
  createBackend
}