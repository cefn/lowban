const React = require("react")
const PropTypes = require("prop-types")
const {
  List,
  ListItem,
} = require("@material-ui/core")
const { focusAction } = require("../../domain/todo/redux/action")
const { ActionLink } = require("./ActionLink")

function ItemTable({ type, items }) {
  return <List>
    {items.map(item =>
      <ListItem key={item.id}>
        <ActionLink invocation={[focusAction, type, item.id]} >{item.label}</ActionLink>
      </ListItem>)}
  </List>
}
ItemTable.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired
}

module.exports = {
  ItemTable
}