const React = require("react")
const ReactDom = require("react-dom")
const { Provider } = require("react-redux")
const {
  Grid,
  Paper,
} = require("@material-ui/core")

const { launchRootSaga } = require("../domain/todo/redux/saga")
const { filterTasksAction, setEditedAction } = require("../domain/todo/redux/action")

const { SimpleMenu } = require("./controls/SimpleMenu")
const { EditedItemForm } = require("./controls/EditedItemForm")
const { NamedItemList } = require("./controls/NamedItemList")

const {
  reduxStore,
  sagaMiddleware,
  backend,
  rootTask
} = launchRootSaga()

function Dash() {
  return <Provider store={reduxStore}>
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SimpleMenu></SimpleMenu>
        </Grid>
        <Grid item xs={4}>
          <Paper >
            <EditedItemForm />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper >
            <NamedItemList listName="filterTask" invocationById={[setEditedAction, "task"]} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper >
            <NamedItemList listName="filterTag" invocationById={[filterTasksAction]} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper>xs=12</Paper>
        </Grid>
      </Grid>
    </div>
  </Provider>
}


//Launch the UI
ReactDom.render(
  <Dash />,
  document.getElementById("frontend")
)