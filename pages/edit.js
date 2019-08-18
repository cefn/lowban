import React, { Component } from "react"
import { render } from "react-dom"
import Form from "react-jsonschema-form"

const log = type => console.log.bind(console, type)

const schema = {
  title: "Todo",
  type: "object",
  required: ["title"],
  properties: {
    title: { type: "string", title: "Title", default: "A new task" },
    done: { type: "boolean", title: "Done?", default: false }
  }
}

function Edit() {
  return (
    <Form
      schema={schema}
      onChange={log("changed")}
      onSubmit={log("submitted")}
      onError={log("errors")}
    />
  )
}

export default Edit
