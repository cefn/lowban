import React from "react"
import Nav from "./Nav"
import View from "./View"
import List from "./List"

class Dash extends React.Component {
  render() {
    return <React.Fragment>
      <Nav />
      <View />
      <List />
    </React.Fragment>
  }
}

export default Dash