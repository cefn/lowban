import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

import React from "react"
import ReactDom from "react-dom"
import Dash from "components/Dash"

alert("Hi")
ReactDom.render(<Dash />, document.getElementById("app"))
