const nodeFetch = require("node-fetch")
const { getRemoteResponse } = require("../lib/util/graphql")
const { host } = require("../defaults")

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

async function loadSchema(type) {
  return getFromPath(`schema/${type}`)
}

module.exports = {
  loadSchema,
}
