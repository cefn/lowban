import React, { useState, useEffect } from "react"
import { Form } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getRemoteResponse } from "../lib/util/graphql"

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
        <Form.Label>Tags</Form.Label>
        <Form.Control placeholder="Filter" onChange={handleFieldChange} />
        <Form.Text className="text-muted">
          space-separated
        </Form.Text>
      </Form.Group>
    </Form>
    <ul className="list-group">
      {itemList.map((item, key) => <li key={key} className="list-group-item">
        <Link to={`/edit/tag/${item.id}`}>{item.label ? item.label : item.id}</Link>
      </li>)}
    </ul>

  </React.Fragment>


}

export default FilteredTagList