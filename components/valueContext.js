/* eslint-disable react/prop-types */
import React, { createContext, useState, useContext } from "react"
import PropTypes from "prop-types"
import { Nav } from "react-bootstrap"

const ValueContext = createContext({})

function getSetterName(valueName) {
  return `${valueName}Setter`
}

function ValueRoot(props) {
  const providerValue = {}
  for (const valueName of props.names) {
    const [value, setter] = useState(props[valueName])
    providerValue[valueName] = value
    providerValue[getSetterName(valueName)] = setter
  }
  return <ValueContext.Provider value={providerValue}>
    {props.children}
  </ValueContext.Provider>
}
ValueRoot.propTypes = {
  names: PropTypes.arrayOf(PropTypes.string).isRequired
}

function ValueGetter(props) {
  return <ValueContext.Consumer>
    {(contextValue) => props.children(contextValue[props.name])}
  </ValueContext.Consumer>
}
ValueGetter.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired
}

function ValueSetter(props) {
  const setter = useContext(ValueContext)[getSetterName(props.name)]
  return <Nav.Link href="#" onClick={() => { setter(props.value) }}>
    {props.children}
  </Nav.Link>
}

export {
  ValueContext,
  ValueRoot,
  ValueGetter,
  ValueSetter
}


