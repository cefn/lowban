const { spawn } = require("redux-saga/effects")

const { launchStore } = require("./store")
const { defaultState, getSchemaPath, getRowPath } = require("./store")
const { lazyPopulatePathSaga, } = require("../../lib/util/redux/path")
const { selectorChangeSaga } = require("../../lib/util/redux/watch")
const backend = require("../../client/backend")

function* loadSchema(type) {
  yield* lazyPopulatePathSaga(getSchemaPath(type), backend.loadSchema, type)
}

function* loadRow(type, id) {
  yield* lazyPopulatePathSaga(getRowPath(type, id), backend.loadItem, type, id)
}

function* ensureFocusSchemaLoaded() {
  yield* selectorChangeSaga(state => state.focusType, function* (focusType) {
    if (focusType) {
      yield* loadSchema(focusType)
    }
  })
}

function* ensureFocusRowLoaded() {
  yield* selectorChangeSaga(state => [state.focusType, state.focusId], function* ([focusType, focusId]) {
    if (focusType && focusId) {
      yield* loadRow(focusType, focusId)
    }
  })
}

function* rootSaga() {
  yield spawn(ensureFocusSchemaLoaded)
  yield spawn(ensureFocusRowLoaded)
}

function launchRootSaga(initialState = defaultState) {
  const [reduxStore, sagaMiddleware] = launchStore(initialState)
  const task = sagaMiddleware.run(rootSaga)
  return [reduxStore, sagaMiddleware, task]
}

module.exports = {
  loadSchema,
  loadRow,
  ensureFocusSchemaLoaded,
  ensureFocusRowLoaded,
  rootSaga,
  launchRootSaga
}