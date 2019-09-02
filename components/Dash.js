import React from "react"
import { Container, Row, Col } from "react-bootstrap"
import Menu from "./Menu"
import Edit from "./Edit"
import FrameSet from "./FrameSet"
import Frame from "./Frame"
import ItemList from "./ItemList"
import FilteredTaskList from "./FilteredTaskList"
import FilteredTagList from "./FilteredTagList"

export default function Dash() {

  return <React.Fragment>
    <FrameSet>
      <Container>
        <Row>
          <Col>
            <Menu />
          </Col>
        </Row>
        <Row>
          <Col>
            <Frame path="/edit/:type/:id">
              <Edit type="task" />
            </Frame>
          </Col>
          <Col>
            <FilteredTaskList />
          </Col>
          <Col>
            <FilteredTagList />
          </Col>
          {/**
          <Col>
            <ItemList type="task" />
          </Col>
          <Col>
            <ItemList type="tag" />
            <TagList />
          </Col>
             */}
        </Row>
      </Container>
    </FrameSet>
  </React.Fragment>
}