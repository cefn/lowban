import React from "react"
import ReactDom from "react-dom"
import { Provider } from "react-redux"

import { connect } from "react-redux"
import { setPathsAction } from "../lib/util/redux/path"
import { saveItemAction } from "../domain/action"
import { launchRootSaga } from "../domain/saga"

import Editor from "./controls/Editor"

const [reduxStore, sagaMiddleware, rootTask] = launchRootSaga()

/* CONFIGURE REDUX CONNECTOR */

//map redux store to react props 
const editorStateToProps = ({ focusType, focusId } /*, ownProps*/) => ({
  focusType,
  focusId,
})

//make actions available to react props 
const editorDispatchToProps = {
  focus: (focusType, focusId) => setPathsAction({ focusType, focusId }),
  save: (type, item) => saveItemAction(type, item)
}

//redux-react adapter
const editorBinding = connect(editorStateToProps, editorDispatchToProps)

//create editor component with Redux binding
const ReduxEditor = editorBinding(Editor)

//Launch the UI
ReactDom.render(
  <Provider store={reduxStore}>
    <ReduxEditor />
  </Provider>,
  document.getElementById("app")
)