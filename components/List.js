import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { getRemoteResponse } from "../lib/util/graphql"

class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: props.type || "task",
      items: []
    }
  }
  async componentDidMount() {
    const response = await getRemoteResponse(
      "{ taskList { label id } }"
    )
    this.setState(_state => this.state.items = response.data.taskList)
  }
  render() {
    return <ul>
      {this.state.items.map((item, key) => (
        <li key={key}>
          <Link to={`/edit/task/${item.id}`}>{item.label}</Link>
        </li>
      ))}
    </ul>
  }
}

List.propTypes = {
  type: PropTypes.string
}

export default List
