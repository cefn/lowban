import React from "react"
import { getRemoteResponse } from "../lib/util/graphql"

class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: "task",
      items: []
    }
  }
  async componentDidMount() {
    const response = await getRemoteResponse(
      "http://localhost:3000/graphql",
      "{ taskList { label } }"
    )
    this.setState(_state => this.state.items = response.data.taskList)
  }
  render() {
    return <ul>
      {this.state.items.map((item, key) => (
        <li key={key}>
          {item.label}
        </li>
      ))}
    </ul>
  }
}

export default List
