import React, { createContext, useState, useContext } from "react"
import PropTypes from "prop-types"
import { Nav } from "react-bootstrap"

function createClickSpace(valueMap) {

  const ClickContext = createContext({})

  function getSetterName(valueName) {
    return `${valueName}Setter`
  }

  function ClickRoot(props) {
    const providerValue = {}
    for (const valueName of Object.keys(valueMap)) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [value, setter] = useState(valueMap[valueName])
      providerValue[valueName] = value
      providerValue[getSetterName(valueName)] = setter
    }
    return <ClickContext.Provider value={providerValue}>
      {props.children}
    </ClickContext.Provider>
  }
  ClickRoot.propTypes = {
    names: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.any.isRequired
  }

  function ClickGetter(props) {
    return <ClickContext.Consumer>
      {(contextValue) => props.children(contextValue[props.name])}
    </ClickContext.Consumer>
  }
  ClickGetter.propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  }

  function ClickSetter(props) {
    const setter = useContext(ClickContext)[getSetterName(props.name)]
    return <Nav.Link href="#" onClick={() => { setter(props.value) }}>
      {props.children}
    </Nav.Link>
  }
  ClickSetter.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    children: PropTypes.any.isRequired
  }

  return {
    ClickContext,
    ClickRoot,
    ClickGetter,
    ClickSetter,
  }

}


export {
  createClickSpace as createGlobals
}


