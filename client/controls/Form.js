const React = require("react")
const PropTypes = require("prop-types")
const {
  List,
  ListItem,
  TextField,
  Card,
} = require("@material-ui/core")

const { getPropertyNames } = require("../../domain/todo/schema/fields")

function Form(props) {
  const { type, save } = props
  let { item } = props

  if (!type) {
    return <Card>
      Cannot render form. Need to know data type
    </Card>
  }

  if (!item) {
    const names = getPropertyNames(type)
    item = Object.fromEntries(names.map(name => [name, null]))
  }

  function createChangeHandler(name) {
    return (event) => {
      item[name] = event.target.value
      save(type, item)
    }
  }

  return <React.Fragment>
    <List>
      {Object.entries(item).map(
        ([name, value]) => <ListItem key={name} >
          <TextField
            label={name}
            value={value || ""}
            onChange={createChangeHandler(name)} />
        </ListItem>)}
    </List>
  </React.Fragment>
}
Form.propTypes = {
  item: PropTypes.object,
  type: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired
}

module.exports = {
  Form
}