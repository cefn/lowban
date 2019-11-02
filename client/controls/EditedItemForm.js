const React = require("react")
const cloneDeep = require("lodash/cloneDeep")
const { connect } = require("react-redux")
const { saveItemAction } = require("../../domain/todo/redux/action")
const { ItemForm } = require("./ItemForm")
const { getPropertyNames } = require("../../domain/todo/schema/fields")

const stateToProps = (state) => {
  const { item, type } = state.editor
  return {
    item: cloneDeep(item), //HAS to be a deep clone to prevent state being manipulated
    fieldNames: type ? getPropertyNames(type) : []
  }
}
const dispatchToProps = (dispatch) => ({
  dirty: (item) => dispatch(saveItemAction(item))
})

function EditedItemForm(props) {
  const bindForm = connect(stateToProps, dispatchToProps)
  const BoundItemForm = bindForm(ItemForm)
  return <BoundItemForm {...props} />
}

module.exports = {
  EditedItemForm
}