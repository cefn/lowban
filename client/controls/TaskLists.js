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

  const tabStyle = {
    minWidth: "64px",
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
        >
          <Tab label="Relevance" style={tabStyle} />
          <Tab label="Time" style={tabStyle} />
          <Tab label="Fulfilled" style={tabStyle} />
        </Tabs>
      </AppBar>
      {[...["tasksByRelevant", "tasksByTime", "tasksFulfilled"].entries()].map(([listIndex, listName]) => {
        return <TabPanel key={listIndex} index={listIndex} value={value} dir={theme.direction}>
          <NamedItemList listName={listName} type="task" invocationById={[setEditedAction, "task"]} styleByItem={styleTaskByPriority} />
        </TabPanel>
      })}
    </React.Fragment>
  )
}

module.exports = {
  TaskLists
}