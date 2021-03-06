const fetch = require("isomorphic-unfetch")
const { graphql } = require("graphql")

async function getRemoteResponse(endpoint, query, variables, throwErrors = true) {
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
  const response = await res.json()
  if (throwErrors) {
    return checkResponse(response)
  }
  else {
    return response
  }
}

async function getLocalResponse(schema, query, variables, throwErrors = true) {
  const root = null
  const context = null
  const response = await graphql(schema, query, root, context, variables)
  if (throwErrors) {
    return checkResponse(response)
  }
  else {
    return response
  }
}

async function checkResponse(response) {
  if (response.errors) {
    for (let error of response.errors) {
      if (error.originalError) {
        error = error.originalError
      }
      const thrown = new Error()
      Object.assign(thrown, error)
      throw thrown
    }
  }
  return response
}

module.exports = {
  getLocalResponse, getRemoteResponse, checkResponse
}