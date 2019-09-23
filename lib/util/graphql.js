const fetch = require("isomorphic-unfetch")
const { graphql } = require("graphql")
const { endpoint } = require("../../defaults")

async function getRemoteResponse(query, variables, throwErrors = true) {
  const request = { query }
  if (variables) {
    request.variables = variables
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(request)
  })
  const response = res.json()
  if (throwErrors) {
    return checkResponse(response)
  }
  else {
    return response
  }
}

async function getLocalVariablesResponse(schema, query, variables, swallowErrors = false) {
  const root = null
  const context = null
  const response = await graphql(schema, query, root, context, variables)
  return checkResponse(response, swallowErrors)
}

async function getLocalResponse(schema, query, swallowErrors = false) {
  const response = await graphql(schema, query)
  return checkResponse(response, swallowErrors)
}

async function checkResponse(response) {
  if (response.errors) {
    for (let error of response.errors) {
      if (error.originalError) {
        throw error.originalError
      } else {
        throw error
      }
    }
  }
  return response
}

module.exports = {
  getLocalResponse, getRemoteResponse, checkResponse
}