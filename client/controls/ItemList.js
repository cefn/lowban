const React = require("react")
const PropTypes = require("prop-types")
const {
  List,
  ListItem
} = require("@material-ui/core")


const { ActionLink } = require("./Actionable")


function ItemList({ dispatch, type, items, invocationById, styleByItem = () => ({}), ...rest }) {

  return <List {...rest}>
    {items.map(item =>
      <ListItem key={item.id} style={styleByItem(item)} >
        <ActionLink color="inherit" invocation={[...invocationById, item.id]} >{item.label || item.id}</ActionLink>
      </ListItem>
    )}
  </List>
}
ItemList.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  invocationById: PropTypes.array.isRequired,
  styleByItem: PropTypes.func
}

module.exports = {
  ItemList
}