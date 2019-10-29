const React = require("react")
const PropTypes = require("prop-types")
const {
  List,
  ListItem,
  TextField,
} = require("@material-ui/core")

function ItemForm({ item, fieldNames, dirty }) {

  for (const name of fieldNames) {
    item[name] = item[name] || ""
  }

  function createFieldChangeHandler(fieldName) {
    return (event) => {
      //note this has to be set in the closure before setEditedItem
      Object.assign(item, { [fieldName]: event.target.value })
      dirty()
    }
  }

  return <React.Fragment>
    <List>
      {fieldNames.map(
        (fieldName) => <ListItem key={fieldName} >
          <TextField
            label={fieldName}
            value={item[fieldName]}
            onChange={createFieldChangeHandler(fieldName)}
          />
        </ListItem>)}
    </List>
  </React.Fragment>
}
ItemForm.propTypes = {
  item: PropTypes.object,
  fieldNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  dirty: PropTypes.func.isRequired
}

module.exports = {
  ItemForm
}