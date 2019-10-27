const { connect } = require("react-redux")
const { ItemTable } = require("./ItemTable")

const bindList = connect(state => ({
  type: "task", //TODO use graphql introspection to derive type from list name
  items: state.lists.filterTask || [],
}))

const FilteredTaskTable = bindList(ItemTable)

module.exports = {
  FilteredTaskTable
}