import React from "react"
import PropTypes from "prop-types"
import { BrowserRouter as Router } from "react-router-dom"

function FrameSet(props) {
  return <Router>{props.children}</Router>
}
FrameSet.propTypes = {
  children: PropTypes.node.isRequired
}

export default FrameSet