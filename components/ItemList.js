import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { getRemoteResponse } from "../lib/util/graphql"

class ItemList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: []
    }
  }
  async componentDidMount() {
    const resolverName = `${this.props.type}List`
    const query = `{ ${resolverName} { ${this.props.typeFields} } }`
    let items
    try {
      const response = await getRemoteResponse(query)
      items = response.data[resolverName]
    }
    catch{
      items = []
    }
    this.setState({ items })
  }
  render() {
    return <ul className="list-group">
      {this.state.items.map((item, key) => <li key={key} className="list-group-item">
        <Link to={`/edit/${this.props.type}/${item.id}`}>{item.label ? item.label : item.id}</Link>
      </li>)}
    </ul>
  }
}
ItemList.propTypes = {
  type: PropTypes.string.isRequired,
}
ItemList.defaultProps = {
  typeFields: "id label"
}


export default ItemList