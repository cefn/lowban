const React = require("react")
const { connect } = require("react-redux")
const { saveItemAction } = require("../../domain/todo/redux/action")
const { ItemForm } = require("./ItemForm")
const { getPropertyNames } = require("../../domain/todo/schema/fields")

const stateToProps = (state) => {
  const { item, type } = state.editor
  return {
    item: item || {},
    fieldNames: type ? getPropertyNames(type) : []
  }
}
const dispatchToProps = (dispatch) => ({
  dirty: () => dispatch(saveItemAction())
})

function EditedItemForm() {
  const bindForm = connect(stateToProps, dispatchToProps)
  const BoundItemForm = bindForm(ItemForm)
  return <BoundItemForm />
}

module.exports = {
  EditedItemForm
}