const React = require("react")
const PropTypes = require("prop-types")
const { connect } = require("react-redux")
const { Link, Button } = require("@material-ui/core")

function dispatchOnClick(Component) {
  const bindDispatch = connect() // bind redux dispatch only
  const DispatchComponent = bindDispatch(props => {
    const { dispatch, invocation, ...descendantProps } = props
    const [action, ...args] = invocation
    return <Component {...descendantProps} onClick={() => dispatch(action(...args))} />
  })
  DispatchComponent.propTypes = {
    invocation: PropTypes.array.isRequired,
    children: PropTypes.node.isRequired
  }
  return DispatchComponent
}

const DispatchLink = dispatchOnClick(Link)
const DispatchButton = dispatchOnClick(Button)

module.exports = {
  DispatchLink,
  DispatchButton
}
