const React = require("react")
const PropTypes = require("prop-types")
const { connect } = require("react-redux")
const { ItemList } = require("./ItemList")

const { getListType } = require("../../domain/todo/schema/fields")

function NamedItemList({ listName, invocationById }) {
  const listType = getListType(listName)
  const bindList = connect(state => ({
    type: listType, //TODO use graphql introspection to derive type from list name
    items: state.lists[listName] || [],
  }))
  const Component = bindList(ItemList)
  return <Component invocationById={invocationById} />
}
NamedItemList.propTypes = {
  listName: PropTypes.string.isRequired,
  invocationById: PropTypes.array.isRequired
}

module.exports = {
  NamedItemList
}