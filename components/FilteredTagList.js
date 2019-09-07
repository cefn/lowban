import React, { useState, useEffect } from "react"
import { Form } from "react-bootstrap"
import { getRemoteResponse } from "../lib/util/graphql"
import { ValueSetter } from "./valueContext"

function FilteredTagList(props) {
  const [filterString, setFilterString] = useState("")
  const [itemList, setItemList] = useState([])
  useEffect(() => {
    const fieldList = "id label"
    let resolver, args
    if (filterString) {
      resolver = "filterTagList"
      args = `(filter:"${filterString}")`
    }
    else {
      resolver = "tagList"
      args = ""
    }
    const query = `{ ${resolver}${args} { ${fieldList} } }`
    const retrieve = async () => {
      const response = await getRemoteResponse(query)
      const items = response.data[resolver]
      setItemList(items)
    }
    retrieve()
  }, [filterString])

  const handleFieldChange = e => {
    setFilterString(e.target.value)
  }

  return <React.Fragment>
    <Form>
      <Form.Group controlId="filterStringId">
        <Form.Label>Search Tags</Form.Label>
        <Form.Control placeholder="Type Filter String" onChange={handleFieldChange} />
        <Form.Text className="text-muted">
          space-separated matchers
        </Form.Text>
      </Form.Group>
    </Form>
    <ul className="list-group">
      {itemList.map((item, key) => <li key={key} className="list-group-item">
        <ValueSetter value={item.id} name="tagId">{item.label ? item.label : item.id}</ValueSetter>
      </li>)}
    </ul>

  </React.Fragment>


}

export default FilteredTagList