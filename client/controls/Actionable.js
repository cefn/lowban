const React = require("react")
const PropTypes = require("prop-types")
const { connect } = require("react-redux")
const { Link, Button } = require("@material-ui/core")

function makeActionable(Component) {
  const bindDispatch = connect() // bind redux dispatch only
  const Actionable = bindDispatch(props => {
    const { dispatch, invocation, ...descendantProps } = props
    const [action, ...args] = invocation
    return <Component {...descendantProps} onClick={() => dispatch(action(...args))} />
  })
  Actionable.propTypes = {
    invocation: PropTypes.array.isRequired,
    children: PropTypes.node.isRequired
  }
  return Actionable
}

const ActionLink = makeActionable(Link)
const ActionButton = makeActionable(Button)

module.exports = {
  ActionLink,
  ActionButton
}
