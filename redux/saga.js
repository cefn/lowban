/* eslint-disable require-atomic-updates */
const isEqual = require("lodash/isEqual")
const { take, select, call, put, spawn } = require("redux-saga/effects")

const { getPathSelector } = require("../lib/util/selector")

const { setPathsAction, createSagaPathStore } = require("../redux/store")
const { defaultState, getSchemaPath, getRowPath } = require("./state")
const backend = require("../client/backend")

function* monitorSelector(valueSelector, valueFilter, takePattern = "*") {
  while (true) {
    const nextValue = yield select(valueSelector)
    if (valueFilter(nextValue)) {
      return nextValue
    }
    yield take(takePattern)
  }
}

function* selectorChangeSaga(selector, saga) {
  let previous
  while (true) {
    const next = yield* monitorSelector(selector, next => !isEqual(next, previous))
    yield* saga(next, previous)
    previous = next
  }
}

function* populate(path, ...invocation) {
  const next = yield call(...invocation)
  yield put(setPathsAction({ [path]: next }))
}

function* lazyPopulate(path, ...invocation) {
  const previous = yield select(getPathSelector(path))
  if (previous) {
    return
  }
  else {
    yield* populate(path, ...invocation)
  }
}

function* loadSchema(type) {
  yield* lazyPopulate(getSchemaPath(type), backend.loadSchema, type)
}

function* loadRow(type, id) {
  yield* lazyPopulate(getRowPath(type, id), backend.loadItem, type, id)
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
}

function launchRootSaga(initialState = defaultState) {
  const [reduxStore, sagaMiddleware] = createSagaPathStore(initialState)
  sagaMiddleware.run(rootSaga)
  return [reduxStore, sagaMiddleware]
}

module.exports = {
  testing: {
    monitorSelector,
    selectorChangeSaga,
    populate,
    lazyPopulate,
    loadSchema,
    loadRow,
    ensureFocusSchemaLoaded,
    ensureFocusRowLoaded,
    rootSaga,
  },
  launchRootSaga
}