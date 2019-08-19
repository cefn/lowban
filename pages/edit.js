import React, { Component } from "react"
import { render } from "react-dom"
import Form from "react-jsonschema-form"
const fetch = require("isomorphic-unfetch")

async function fetchSchema(typeName) {
  const endpoint = `http://localhost:3000/schema/${typeName}`
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  })
  return res.json()
}

const log = type => console.log.bind(console, type)

function Edit(props) {
  return (
    <Form
      schema={props.schema}
      onChange={log("changed")}
      onSubmit={log("submitted")}
      onError={log("errors")}
    />
  )
}

Edit.getInitialProps = async function() {
  const schema = await fetchSchema("task")
  return { schema }
}

export default Edit
