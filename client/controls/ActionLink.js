const React = require("react")
const PropTypes = require("prop-types")
const { connect } = require("react-redux")
const { Link } = require("@material-ui/core")

const bindDispatch = connect() //empty redux connect = dispatch only
const ActionLink = bindDispatch(({ dispatch, invocation, children }) => {
  const [action, ...args] = invocation
  return <Link onClick={() => dispatch(action(...args))}>{children}</Link>
})
ActionLink.propTypes = {
  invocation: PropTypes.array.isRequired,
  children: PropTypes.node.isRequired
}

module.exports = {
  ActionLink
}
