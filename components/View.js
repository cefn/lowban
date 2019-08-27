import React from "react"
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

class View extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      uiSchema: {
        note: {
          "ui:widget": "textarea",
          "ui:options": {
            rows: 4
          }
        }
      }
    }
  }
  async componentDidMount() {
    const mergeState = {}
    const schema = await fetchSchema("task")
    mergeState.schema = schema

    const order = schema["$order"]
    if (Array.isArray(order)) {
      mergeState.order = order
    }
    this.setState((state) => Object.assign(state, mergeState))
  }
  render() {
    if (this.state.schema && this.state.uiSchema) {
      return <Form
        schema={this.state.schema}
        uiSchema={this.state.uiSchema}
        onChange={log("changed")}
        onSubmit={submit}
        onError={log("errors")}
      />
    }
    else {
      return null
    }

  }
}

export default View