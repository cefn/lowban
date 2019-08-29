import React from "react"
import Nav from "./Nav"
import View from "./View"
import List from "./List"
import FrameSet from "./FrameSet"
import Frame from "./Frame"

export default function Dash() {
  return <React.Fragment>
    <FrameSet>
      <Nav />
      <Frame path="/view/:type/:id">
        <View />
      </Frame>
      <Frame path="/list/:type">
        <List />
      </Frame>
    </FrameSet>
  </React.Fragment>
}