import React from "react"
import PropTypes from "prop-types"
import Form from "react-jsonschema-form"
import fetch from "isomorphic-unfetch"
import { host } from "../defaults"
import { initialCapital } from "../lib/taggraphql"
import { editableData, storableData } from "../lib/util/form"

async function fetchGraphqlResponse(request) {
  let response = await fetch(`${host}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(request)
  })
  response = response.json()
  return response
}

//TODO figure out how to couple json-schema definitions of a type's fields (for form creation) 
//and the graphql definitions of a type's fields (for data retrieval to populate form)
async function fetchData(typeName, id) {
  const query = `{
    ${typeName}(id:"${id}"){
      id
      label
      note
      tagIds
    }
  }`
  let response = await fetchGraphqlResponse({ query })
  let dbData = response.data[typeName]
  return dbData
}

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

class Edit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.state.uiSchema = {
      note: {
        "ui:widget": "textarea",
        "ui:options": {
          rows: 8
        }
      },
      id: {
        "ui:widget": "hidden",
      }
    }
  }
  async componentDidMount() {
    return await this.loadFormData()
  }
  render() {
    if (!this.state.schema) {
      return <p>Loading</p>
    }
    let formData
    if (this.state.dbData) {
      formData = editableData(this.state.dbData)
    }
    return <Form
      liveValidate={false}
      schema={this.state.schema}
      uiSchema={this.state.uiSchema}
      formData={formData}
      onSubmit={({ formData }, _e) => this.storeFormData(formData)}
      onError={console.log}
    />
  }
  async loadFormData() {
    const schemaPromise = fetchSchema(this.props.type)
    const dbDataPromise = this.props.id ? fetchData(this.props.type, this.props.id) : Promise.resolve()
    const [schema, dbData] = await Promise.all([schemaPromise, dbDataPromise])

    //create a map of new values for setState
    const mergeState = {}

    // handle type schema and matching field-ordering config
    mergeState.schema = schema
    const order = schema["$order"]
    if (Array.isArray(order)) { //override current order
      mergeState.uiSchema = Object.assign({ "ui:order": order }, this.state.uiSchema)
    }

    //handle item data
    if (dbData) {
      mergeState.dbData = dbData
    }

    this.setState((state) => Object.assign(state, mergeState))
  }
  async storeFormData(formData) {
    let dbData = storableData(formData)
    let variables = {
      submitted: dbData
    }
    let typeName = "task" //TODO remove this hard-coding
    let queryResolverName = `${typeName}Save`
    let queryInputSpec = `${initialCapital(typeName)}Input!`
    let query = `mutation ($submitted:${queryInputSpec}){
      ${queryResolverName}(input:$submitted){ id }
    }`
    let response = await fetchGraphqlResponse({
      query, variables
    })
    let resolved = response.data[queryResolverName]
    //merge resulting id back into data
    let id = resolved.id
    if (dbData.id !== id) {
      this.setState((_prevState, _props) => { //merge id into data
        return ({
          dbData: Object.assign(dbData, { id })
        })
      })
    }
  }
}

Edit.propTypes = {
  type: PropTypes.string.isRequired,
  id: PropTypes.string
}

export default Edit