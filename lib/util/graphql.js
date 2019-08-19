const fetch = require("isomorphic-unfetch")
const { graphql } = require("graphql")

async function getRemoteResponse(endpoint, query, swallowErrors = false) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ query })
  })
  const response = res.json()
  return checkResponse(response, swallowErrors)
}

async function getLocalResponse(schema, query, swallowErrors = false) {
  const response = await graphql(schema, query)
  return checkResponse(response, swallowErrors)
}

async function checkResponse(response, swallowErrors) {
  //workaround for GraphQL swallowing all errors from backing datastore
  if (!swallowErrors) {
    if (response.errors) {
      for (let error of response.errors) {
        if (error.originalError) {
          throw error.originalError
        } else {
          throw error
        }
      }
    }
  }
  return response
}

module.exports = { getLocalResponse, getRemoteResponse }
