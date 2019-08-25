import React, { Component } from "react"
import { render } from "react-dom"
import Form from "react-jsonschema-form"
const fetch = require("isomorphic-unfetch")
const { host } = require("../defaults")

async function fetchSchema(typeName) {
  const endpoint = `${host}/schema/${typeName}`
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  })
  return res.json()
}

const log = type => console.log.bind(console, type)

function submit({ formData, schema }, e) {
  console.log("schemaData: " + JSON.stringify(schema))
  console.log("formData: " + JSON.stringify(formData))
  const fetch = require("isomorphic-unfetch")

  return fetch(`${host}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      query: `mutation ($submitted:TaskInput!){
            saveEditedTask(input:$submitted){
                id
            }
        }`,
      variables: {
        submitted: formData
      }
    })
  })
    .then(r => r.json())
    .then(data => console.log("data returned:", data))
}

function Edit(props) {
  return (
    <Form
      schema={props.schema}
      uiSchema={props.uiSchema}
      onChange={log("changed")}
      onSubmit={submit}
      onError={log("errors")}
    />
  )
}

Edit.getInitialProps = async function() {
  const schema = await fetchSchema("task")
  let uiSchema = {
    note: {
      "ui:widget": "textarea",
      "ui:options": {
        rows: 4
      }
    }
  }
  const order = schema["$order"]
  if (Array.isArray(order)) {
    Object.assign(uiSchema, {
      "ui:order": order
    })
  }
  return {
    schema,
    uiSchema
  }
}

export default Edit
