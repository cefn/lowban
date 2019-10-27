const React = require("react")
const ReactDom = require("react-dom")
const { createStore } = require("redux")
const { Provider: ReduxProvider } = require("react-redux")
const { createBackend } = require("./backend")

const { launchRootSaga } = require("../domain/todo/redux/saga")

const {
  Grid,
  Paper,
} = require("@material-ui/core")
const { makeStyles } = require("@material-ui/core/styles")

const { SimpleMenu } = require("./controls/SimpleMenu")
const { Form } = require("./controls/Form")
const { FilteredTaskTable } = require("./controls/FilteredTaskTable")

const {
  reduxStore,
  sagaMiddleware,
  backend,
  rootTask
} = launchRootSaga()

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  "MuiLink-underlineHover": {
    cursor: "pointer",
    backgroundColor: "red"
  }
}))

let item = null
let type = "task"
let save = backend.saveItem

function Dash() {

  const classes = useStyles()

  return <ReduxProvider store={reduxStore}>
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SimpleMenu></SimpleMenu>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <Form item={item} type={type} save={save} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <FilteredTaskTable />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>xs=12</Paper>
        </Grid>
      </Grid>
    </div>
  </ReduxProvider>
}


//Launch the UI
ReactDom.render(
  <Dash />,
  document.getElementById("frontend")
)