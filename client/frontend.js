const React = require("react")
const ReactDom = require("react-dom")
const { Provider } = require("react-redux")
const { connect } = require("react-redux")
const { setPathsAction } = require("../lib/util/redux/path")
const { saveItemAction } = require("../domain/todo/redux/action")

const { launchRootSaga } = require("../domain/todo/redux/saga")

const Editor = require("./controls/Editor")

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