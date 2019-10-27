const { spawn, getContext, setContext } = require("redux-saga/effects")
const { launchPathStore } = require("../../../lib/util/redux/path")
const { defaultState, getSchemaPath, getRowPath, getListPath } = require("./store")
const { populatePathSaga, lazyPopulatePathSaga, } = require("../../../lib/util/redux/path")
const { selectorChangeSaga } = require("../../../lib/util/redux/watch")
const { createBackend } = require("../../../client/backend")
const { host } = require("../../../server/defaults")

function* loadSchemaSaga(type) {
  const backend = yield getContext("backend")
  yield* lazyPopulatePathSaga(getSchemaPath(type), backend.loadSchema, type)
}

function* loadRowSaga(type, id) {
  const backend = yield getContext("backend")
  yield* lazyPopulatePathSaga(getRowPath(type, id), backend.loadItem, type, id)
}

function* loadListSaga(listName, listArgs = null, listFields = ["id", "label"]) {
  const backend = yield getContext("backend")
  yield* populatePathSaga(getListPath(listName), backend.loadList, listName, listArgs, listFields)
}

function* ensureFocusSchemaLoaded() {
  yield* selectorChangeSaga(state => state.focusType, function* (focusType) {
    if (focusType) {
      yield* loadSchemaSaga(focusType)
    }
  })
}

function* ensureFocusRowLoaded() {
  yield* selectorChangeSaga(state => [state.focusType, state.focusId], function* ([focusType, focusId]) {
    if (focusType && focusId) {
      yield* loadRowSaga(focusType, focusId)
    }
  })
}

function* ensureFilterTaskListLoaded() {
  yield* selectorChangeSaga(state => state.focusString, function* (focusString) {
    focusString = focusString || ""
    yield* loadListSaga("filterTask", { filter: focusString })
  })
}

function* rootSaga() {
  yield spawn(ensureFocusSchemaLoaded)
  yield spawn(ensureFocusRowLoaded)
  yield spawn(ensureFilterTaskListLoaded)
}

function launchRootSaga(initialState = defaultState) {
  const backend = createBackend(host)
  const context = { backend }
  const [reduxStore, sagaMiddleware] = launchPathStore(initialState, context)
  const rootTask = sagaMiddleware.run(rootSaga)
  return {
    reduxStore,
    sagaMiddleware,
    backend,
    rootTask
  }
}

module.exports = {
  loadSchemaSaga,
  loadRowSaga,
  loadListSaga,
  ensureFocusSchemaLoaded,
  ensureFocusRowLoaded,
  ensureFilterTaskListLoaded,
  rootSaga,
  launchRootSaga
}