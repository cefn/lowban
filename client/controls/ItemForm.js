const React = require("react")
const PropTypes = require("prop-types")
const {
  List,
  ListItem,
  TextField,
  TextareaAutosize,
} = require("@material-ui/core")

function ItemForm({ item, fieldNames, areaFieldNames, dirty }) {

  if (!item) {
    return <h1>Waiting to load item</h1>
  }

  function createFieldChangeHandler(fieldName) {
    return (event) => {
      //note this has to be set in the closure before setEditedItem
      Object.assign(item, { [fieldName]: event.target.value })
      dirty(item)
    }
  }

  return <List>
    {fieldNames.map((fieldName) => {
      let props = {
        label: fieldName,
        value: item[fieldName] || "",
        onChange: createFieldChangeHandler(fieldName),
        style: { width: "100%" },
      }
      if (areaFieldNames && areaFieldNames.includes(fieldName)) { //use a text area
        return <ListItem key={fieldName} > <TextareaAutosize {...props} rows={10} /> </ListItem>
      }
      else { //use a normal field
        return <ListItem key={fieldName} > <TextField {...props} /> </ListItem>
      }
    })}
  </List>
}
ItemForm.propTypes = {
  item: PropTypes.object,
  fieldNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  areaFieldNames: PropTypes.arrayOf(PropTypes.string),
  dirty: PropTypes.func.isRequired
}

module.exports = {
  ItemForm
}