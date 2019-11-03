const isPlainObject = require("lodash/isPlainObject")
const get = require("lodash/get")
const set = require("lodash/set")
const { createStore, applyMiddleware, compose } = require("redux")
const reduxSaga = require("redux-saga").default
const { call, put, select } = require("redux-saga/effects")


const SET_PATHS = "set-paths"
const DEFAULT_PATHS = "default-paths"

function setPathsAction(pathMap) {
  return {
    type: SET_PATHS,
    payload: pathMap
  }
}

function defaultPathsAction(pathMap) {
  return {
    type: DEFAULT_PATHS,
    payload: pathMap
  }
}

function createPathSetter(dispatch, path, value) {
  return () => {
    dispatch(setPathsAction({ [path]: value }))
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
  return next
}

/** Sets path to (eventual) result of invocation if path not currently truthy.
 * Invocation is run by redux-saga call (see https://redux-saga.js.org/docs/api/#callfn-args ). */
function* lazyPopulatePathSaga(path, ...invocation) {
  const previous = yield select(getPathSelector(path))
  if (previous) {
    return previous
  }
  else {
    return yield* populatePathSaga(path, ...invocation)
  }
}

/** Sets all path keys from (eventual) map returned by the invocation to the mapped values
 * Invocation is run by redux-saga call (see https://redux-saga.js.org/docs/api/#callfn-args ). */
function* populatePathMapSaga(...invocation) {
  const pathMap = yield call(...invocation)
  yield put(setPathsAction(pathMap))
  return pathMap
}

function setPathsReducer(state = {}, action) {
  //seeks values and paths in the payload which define merges
  const { type, payload } = action
  if ([SET_PATHS, DEFAULT_PATHS].includes(type)) {
    if (isPlainObject(payload)) { //map of paths to values
      const entries = Object.entries(payload)
      if (entries.length > 0) {
        state = { ...state }
        for (const [path, value] of entries) {
          if (type === SET_PATHS ||
            ((type === DEFAULT_PATHS) && (typeof get(state, path) === "undefined"))) {
            set(state, path, value)
          }
        }
        return state
      }
    }
    throw `Malformed '${type}' action ${JSON.stringify(payload)}`
  }
  return state
}

function launchPathStore(initialState, context) {
  const sagaOpts = context ? { context } : {}
  const sagaMiddleware = reduxSaga(sagaOpts)
  //TODO hide behind debug or development flag
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  const reduxStore = createStore(
    setPathsReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(sagaMiddleware)
    )
  )
  return [reduxStore, sagaMiddleware]
}

module.exports = {
  setPathsAction,
  defaultPathsAction,
  createPathSetter,
  populatePathMapSaga,
  populatePathSaga,
  lazyPopulatePathSaga,
  getPathSelector,
  setPathsReducer,
  launchPathStore,
}
