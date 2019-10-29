import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import Form from "react-jsonschema-form"
import fetch from "isomorphic-unfetch"
import { host } from "../server/defaults"
import { initialCapital } from "../lib/util/javascript"
import { editableData, storableData } from "../domain/todo/schema/form"

//TODO remove and replace with lib/util/graphql invocations
//which handle errors properly
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
async function fetchDbData(typeName, id) {
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

async function saveUnsavedData(typeName, unsavedData) {
  let variables = {
    submitted: storableData(unsavedData)
  }
  let queryResolverName = `${typeName}Merge`
  let queryInputSpec = `${initialCapital(typeName)}Input!`
  let query = `mutation ($submitted:${queryInputSpec}){
    ${queryResolverName}(input:$submitted){ id }
  }`
  let response = await fetchGraphqlResponse({
    query, variables
  })
  let resolved = response.data[queryResolverName]
  return resolved.id
}


function Edit(props) {
  const [formData, setFormData] = useState(null)
  const [schema, setSchema] = useState(null)
  const [uiSchema, setUiSchema] = useState({
    note: {
      "ui:widget": "textarea",
      "ui:options": {
        rows: 8
      }
    },
    id: {
      "ui:widget": "hidden",
    },
    action: {
      "ui:options": {
        "addable": false
      }
    }
  })

  // handle type schema and matching field-ordering config
  if (schema) {
    if (uiSchema["ui:order"] !== schema.order) {
      setUiSchema({ ...{ "ui:order": schema.order }, uiSchema })
    }
  }

  const refreshSchema = async () => {
    setSchema(await fetchSchema(props.typeName))
  }

  const refreshData = async () => {
    if (formData) { //save any preceding data
      save()
    }
    if (props.typeName && props.id) {
      const dbData = await fetchDbData(props.typeName, props.id)
      setFormData(editableData(dbData))
    }
    else {
      setFormData(null)
    }
  }

  const save = async (isMounted = true) => {
    if (formData) {
      const id = await saveUnsavedData(props.typeName, formData)
      if (isMounted) { //ensure local copies of data have correct record id 
        if (formData && formData.id !== id) {
          setFormData({ ...formData, id })
        }
      }
    }
  }



  useEffect(() => {
    refreshSchema()
  }, [props.typeName, refreshSchema])


  useEffect(() => {
    refreshData()
  }, [props.typeName, props.id, refreshData])

  const handleChange = async ({ formData }, _e) => {
    setFormData(formData)
  }

  if (!schema) {
    return <p>Loading</p>
  }
  return <Form
    liveValidate={false}
    schema={schema}
    uiSchema={uiSchema}
    formData={formData}
    onChange={handleChange}
    onSubmit={save}
    onError={console.log}
  />

}

Edit.propTypes = {
  typeName: PropTypes.string.isRequired,
  id: PropTypes.string
}

export default Edit