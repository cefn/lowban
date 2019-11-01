const React = require("react")
const PropTypes = require("prop-types")
const {
  List,
  ListItem,
} = require("@material-ui/core")
const { ActionLink } = require("./Actionable")

function ItemList({ type, items, invocationById }) {
  return <List>
    {items.map(item =>
      <ListItem key={item.id}>
        <ActionLink invocation={[...invocationById, item.id]} >{item.label || item.id}</ActionLink>
      </ListItem>)}
  </List>
}
ItemList.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  invocationById: PropTypes.array.isRequired
}

module.exports = {
  ItemList
}