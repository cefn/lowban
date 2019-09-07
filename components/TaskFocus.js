import React, { createContext, useContext } from "react"
import PropTypes from "prop-types"

const TaskFocusContext = createContext({
  taskId: null,
  setTaskId: () => { }
})

function TaskFocusLink(props) {
  const { setTaskId } = useContext(TaskFocusContext)
  return <a href="#" onClick={() => { setTaskId(props.id) }}>
    {props.children}
  </a>
}

TaskFocusLink.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node
}

export {
  TaskFocusContext,
  TaskFocusLink
}