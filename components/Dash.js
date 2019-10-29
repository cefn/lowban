import React, {
  useState
} from "react"
import {
  Container,
  Row,
  Col
} from "react-bootstrap"
import Menu from "./Menu"
import Edit from "./Edit"
import FilteredTaskList from "./FilteredTaskList"
import FilteredTagList from "./FilteredTagList"
import { ValueRoot, ValueGetter } from "../lib/util/react/click"

export default function Dash(props) {

  return <ValueRoot names={["taskId", "tagId", "filterString"]}>
    <Container>
      <Row>
        <Col>
          <Menu />
        </Col>
      </Row>
      <Row>
        <Col>
          <ValueGetter name="taskId">
            {(taskId) => {
              return <Edit typeName="task" id={taskId} />
            }}
          </ValueGetter>
        </Col>
        <Col>
          <FilteredTaskList />
        </Col>
        <Col>
          <FilteredTagList />
        </Col>
      </Row>
    </Container>
  </ValueRoot>
}