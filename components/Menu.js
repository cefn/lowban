import React from "react"
import { Nav, Navbar, NavDropdown, Form, FormControl, Button } from "react-bootstrap"
import { ValueSetter } from "../lib/util/react/click"

function Menu(props) {
  return <Navbar bg="light" expand="sm">
    <Navbar.Brand href="#home">Lowban</Navbar.Brand>
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="mr-auto">
        <Nav.Link href="">Home</Nav.Link>
        <ValueSetter name="taskId" value={null} >New Task</ValueSetter>
        <ValueSetter name="tagId" value={null} >New Tag</ValueSetter>
      </Nav>
      {/**
    <Form inline>
      <FormControl type="text" placeholder="Search" className="mr-sm-2" />
      <Button variant="outline-success">Search</Button>
    </Form>
     */}
    </Navbar.Collapse>
  </Navbar>
}

export default Menu
