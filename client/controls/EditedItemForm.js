const React = require("react")
const PropTypes = require("prop-types")
const cloneDeep = require("lodash/cloneDeep")
const { connect } = require("react-redux")
const {
  Grid,
  Toolbar,
} = require("@material-ui/core")

const { ItemForm } = require("./ItemForm")
const { DispatchButton } = require("./ActionDispatch")
const { getPropertyNames } = require("../../domain/todo/schema/fields")

const { saveItemAction, removeItemAction, snoozeTaskAction, fulfilTaskAction, } = require("../../domain/todo/redux/action")

const stateToProps = (state) => {
  const { item, type } = state.editor
  return {
    item: cloneDeep(item), //HAS to be a deep clone to prevent state being manipulated
    type,
    fieldNames: type ? getPropertyNames(type) : []
  }
}
const dispatchToProps = (dispatch) => ({
  dirty: (item) => dispatch(saveItemAction(item))
})

function EditedItemForm(props) {
  const bindForm = connect(stateToProps, dispatchToProps)
  const BoundItemForm = bindForm(props => {
    let buttonBar = null
    const { type, item: { id } } = props
    if (id) {
      buttonBar = (
        <Toolbar>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <DispatchButton variant="contained" color="inherit" invocation={[removeItemAction, type, id]}>Delete</DispatchButton>
            </Grid>
            <Grid item xs={6}>
              <DispatchButton variant="contained" color="primary" invocation={[fulfilTaskAction, id]}>Fulfil</DispatchButton>
            </Grid>
          </Grid>
        </Toolbar>
      )
    }
    return <React.Fragment>
      <ItemForm {...props} />
      {buttonBar}
    </React.Fragment>
  })
  return <BoundItemForm {...props} />
}
EditedItemForm.propTypes = {
  item: PropTypes.object,
}

module.exports = {
  EditedItemForm
}
