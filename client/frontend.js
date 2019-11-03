const React = require("react")
const ReactDom = require("react-dom")
const { Provider: StoreProvider } = require("react-redux")

const {
  Grid,
  Paper,
} = require("@material-ui/core")

const { launchRootSaga } = require("../domain/todo/redux/saga")
const { filterTasksAction } = require("../domain/todo/redux/action")

const { SearchMenu } = require("./controls/SearchMenu")
const { EditedItemForm } = require("./controls/EditedItemForm")
const { NamedItemList } = require("./controls/NamedItemList")
const { TaskLists } = require("./controls/TaskLists")

const {
  reduxStore,
  sagaMiddleware,
  backend,
  rootTask
} = launchRootSaga()

function Dash() {
  return (
    <StoreProvider store={reduxStore}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SearchMenu />
        </Grid>
        <Grid item xs={4}>
          <Paper >
            <EditedItemForm areaFieldNames={["note"]} />
          </Paper>
        </Grid>
        <Grid item xs={4} >
          <Paper>
            <TaskLists />
          </Paper>
        </Grid>
        <Grid item xs={4} >
          <Paper >
            <NamedItemList listName="filterTags" invocationById={[filterTasksAction]} />
          </Paper>
        </Grid>
      </Grid>
    </StoreProvider>
  )
}


//Launch the UI
ReactDom.render(
  <Dash />,
  document.getElementById("frontend")
)
