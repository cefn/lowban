import isPlainObject from "lodash/isPlainObject"
import set from "lodash/set"
import { createStore, applyMiddleware } from "redux"
import reduxSaga from "redux-saga"
import { call, put } from "redux-saga/effects"

const SET_PATHS = "set-value-path-map"

function setPathsAction(pathMap) {
  return {
    type: SET_PATHS,
    payload: pathMap
  }
}

const setPathsReducer = (state = {}, action) => {
  //seeks values and paths in the payload which define merges
  const { type, payload } = action
  if (type === SET_PATHS) {
    if (isPlainObject(payload)) { //map of paths to values
      const entries = Object.entries(payload)
      if (entries.length > 0) {
        state = { ...state }
        for (const [path, value] of entries) {
          set(state, path, value)
        }
        return state
      }
    }
    throw `Malformed '${type}' action ${JSON.stringify(payload)}`
  }
  return state
}

function createSagaPathStore(initialState) {
  const sagaMiddleware = reduxSaga()
  const reduxStore = createStore(
    setPathsReducer, //handles storeValue, storeValueMap, storePromisedValue actions
    initialState,
    applyMiddleware(sagaMiddleware)
  )
  return [reduxStore, sagaMiddleware]
}

export {
  setPathsAction,
  setPathsReducer,
  createSagaPathStore
}
