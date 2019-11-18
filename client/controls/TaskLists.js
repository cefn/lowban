const React = require("react")
const PropTypes = require("prop-types")
const { useTheme, withStyles } = require("@material-ui/core/styles")

const {
  AppBar,
  Tabs,
  Tab,
  Badge,
  Typography,
  Box
} = require("@material-ui/core")

const { NamedItemList } = require("./NamedItemList")

const { editRecordAction } = require("../../domain/todo/redux/action")

const { getTaskPriority, priorityLookup } = require("../../domain/todo/tagmodel")

const TabBadge = withStyles(theme => ({
  badge: {
    right: "-2em",
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}))(Badge)

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
          <Tab label={<TabBadge badgeContent={"TODO"} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} color="secondary">
            Next
          </TabBadge>} style={tabStyle} />
          <Tab label="Open" style={tabStyle} />
          <Tab label="Done" style={tabStyle} />
          <Tab label="All" style={tabStyle} />
        </Tabs>
      </AppBar>
      {[...["tasksByRelevant", "tasksByTime", "tasksFulfilled", "tasksAll"].entries()].map(([listIndex, listName]) => {
        return <TabPanel key={listIndex} index={listIndex} value={value} dir={theme.direction}>
          <NamedItemList listName={listName} type="task" invocationById={[editRecordAction, "task"]} styleByItem={styleTaskByPriority} />
        </TabPanel>
      })}
    </React.Fragment>
  )
}

module.exports = {
  TaskLists
}