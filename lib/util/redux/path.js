const isPlainObject = require("lodash/isPlainObject")
const get = require("lodash/get")
const set = require("lodash/set")
const { createStore, applyMiddleware } = require("redux")
const reduxSaga = require("redux-saga").default
const { call, put, select } = require("redux-saga/effects")


const SET_PATHS = "set-paths"

function setPathsAction(pathMap) {
  return {
    type: SET_PATHS,
    payload: pathMap
  }
}

function getPathSelector(path) {
  return state => get(state, path)
}

/** Sets path to (eventual) result of invocation.
 * Invocation is run by redux-saga call (see https://redux-saga.js.org/docs/api/#callfn-args ). */
function* populatePathSaga(path, ...invocation) {
  const next = yield call(...invocation)
  yield put(setPathsAction({ [path]: next }))
}

/** Sets path to (eventual) result of invocation if path not currently truthy.
 * Invocation is run by redux-saga call (see https://redux-saga.js.org/docs/api/#callfn-args ). */
function* lazyPopulatePathSaga(path, ...invocation) {
  const previous = yield select(getPathSelector(path))
  if (previous) {
    return
  }
  else {
    yield* populatePathSaga(path, ...invocation)
  }
}

/** Sets all path keys from (eventual) map returned by the invocation to the mapped values
 * Invocation is run by redux-saga call (see https://redux-saga.js.org/docs/api/#callfn-args ). */
function* populatePathMapSaga(...invocation) {
  const pathMap = yield call(...invocation)
  yield put(setPathsAction(pathMap))
}

function setPathsReducer(state = {}, action) {
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

function launchPathStore(initialState) {
  const sagaMiddleware = reduxSaga()
  const reduxStore = createStore(
    setPathsReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  )
  return [reduxStore, sagaMiddleware]
}

module.exports = {
  setPathsAction,
  populatePathMapSaga,
  populatePathSaga,
  lazyPopulatePathSaga,
  launchPathStore,
  setPathsReducer
}