const React = require("react")
const { connect } = require("react-redux")
const { makeStyles } = require("@material-ui/core/styles")

const {
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} = require("@material-ui/core")

const AccountCircle = require("@material-ui/icons/AccountCircle").default

const { ActionButton } = require("./Actionable")
const { SearchBox } = require("./SearchBox")

const { setPathsAction } = require("../../lib/util/redux/path")
const { setEditedAction } = require("../../domain/todo/redux/action")

const useStyles = makeStyles(theme => ({
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
}))

function Layout({ dispatch, tagFilterString, taskFilterString }) {

  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const isMenuOpen = Boolean(anchorEl)

  const handleProfileMenuOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const menuId = "primary-search-account-menu"
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  )

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <ActionButton color="inherit" invocation={[setEditedAction, "task", undefined]} > New Task</ActionButton>
            </Grid>
            <Grid item xs={4}>
              <SearchBox placeholder="Tasks..." value={taskFilterString} onChange={event => dispatch(setPathsAction({ "taskFilterString": event.target.value }))} />
            </Grid>
            <Grid item xs={4}>
              <SearchBox placeholder="Tags..." value={tagFilterString} onChange={event => dispatch(setPathsAction({ "tagFilterString": event.target.value }))} />
            </Grid>
          </Grid>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMenu}
    </div>
  )
}

function SearchMenu() {
  const bindDispatch = connect(({ taskFilterString, tagFilterString }) => ({ taskFilterString, tagFilterString }))
  const BoundLayout = bindDispatch(Layout)
  return <BoundLayout />
}

module.exports = {
  SearchMenu
}