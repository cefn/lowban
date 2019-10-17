const nodeFetch = require("node-fetch")
const { getRemoteResponse } = require("../lib/util/graphql")
const { host } = require("../defaults")
const { initialCapital } = require("../lib/util/javascript")
const { getPropertyNames } = require("../lib/util/schema")
const { storableData, editableData } = require("../lib/util/form")

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

//TODO implement itemTypes retriever via store, and corresponding saga (instead of hard-coded values in defaultState)
/*
async function loadItemTypes() {
  return await getRemoteResponse()
}
*/

async function loadIds(itemType) {
  const query = `{ ids(type: "${itemType}") } `
  const response = await getRemoteResponse(query)
  return response.data.ids
}

async function loadItem(itemType, itemId) {
  const resolverName = itemType
  const query = `{
    ${ resolverName} (id: "${itemId}"){
      ${ getPropertyNames(itemType).join(" ")}
    }
  } `
  const response = await getRemoteResponse(query)
  return response.data[resolverName]
}

async function saveItem(itemType, item) {
  const sent = storableData(item) //make schema-compliant
  let variables = { sent }
  let resolverName = `${itemType}Merge`
  let inputSpec = `${initialCapital(itemType)}Input!`
  let query = `mutation ($sent:${inputSpec}){
    ${resolverName}(input:$sent){
      ${ getPropertyNames(itemType).join(" ")}
    }
  }`
  const response = await getRemoteResponse(query, variables)
  const received = response.data[resolverName]
  return editableData(received) //make form-compliant
}

module.exports = {
  loadSchema,
  loadIds,
  loadItem,
  saveItem
}
