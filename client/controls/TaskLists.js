const React = require("react")
const PropTypes = require("prop-types")
const { useTheme } = require("@material-ui/core/styles")

const {
  AppBar,
  Tabs,
  Tab,
  Typography,
  Box
} = require("@material-ui/core")

const { NamedItemList } = require("./NamedItemList")

const { setEditedAction } = require("../../domain/todo/redux/action")

const { getTaskPriority, priorityLookup } = require("../../domain/todo/tagmodel")

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

function TaskLists() {
  const theme = useTheme()

  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const styleTaskByPriority = item => {
    const priority = getTaskPriority(item)
    const { color } = priorityLookup[priority]
    return {
      color: "white",
      backgroundColor: color
    }
  }

  return (
    <React.Fragment>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Relevant" />
          <Tab label="Actionable" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} dir={theme.direction}>
        <NamedItemList listName="filterRelevantTasks" invocationById={[setEditedAction, "task"]} styleByItem={styleTaskByPriority} />
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <NamedItemList listName="filterActionableTasks" invocationById={[setEditedAction, "task"]} />
      </TabPanel>
    </React.Fragment>
  )
}

module.exports = {
  TaskLists
}