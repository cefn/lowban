import { createSagaPathStore } from "./store"
import { spawn } from "redux-saga/effects"


const defaultState = {
  types: [], //list of types
  schemas: {}, //schemas by type
  ids: {}, //id lists by type
  rows: {}, //map rows first by type, then id (as defined by normalizr)
  focusType: null, //the row type in focus
  focusId: null, //the row id in focus
}

function launch(initialState = defaultState) {
  const [reduxStore, sagaMiddleware] = createSagaPathStore(initialState)

  sagaMiddleware.run(function* () {
    yield spawn(focusTypeSaga)
    yield spawn(focusIdSaga)
    yield spawn(loadTypesSaga)
    yield spawn(changeFocusSaga, "note", null)
  })

  return [reduxStore, sagaMiddleware]
}


export { //all values and callbacks
  defaultState,
  launch,
}