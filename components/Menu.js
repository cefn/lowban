import React from "react"
import { Nav, Navbar, NavDropdown, Form, FormControl, Button } from "react-bootstrap"

class Menu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">Lowban</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="">Home</Nav.Link>
          <Nav.Link href="">New Task</Nav.Link>
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
}


export default Menu
