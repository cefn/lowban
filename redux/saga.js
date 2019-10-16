/* eslint-disable require-atomic-updates */
const { take, select, call, put, spawn } = require("redux-saga/effects")
const { setPathsAction } = require("../redux/store")
const backend = require("../client/backend")

function* monitorSelector(selector, valueFilter, takePattern = "*") {
  while (true) {
    const nextValue = yield select(selector)
    if (valueFilter(nextValue)) {
      return nextValue
    }
    yield take(takePattern)
  }
}

function* selectorChangeSaga(selector, saga) {
  let previous
  while (true) {
    const next = yield* monitorSelector(selector, next => next !== previous)
    yield* saga(next, previous)
    previous = next
  }
}

function* ensureSchemaLoaded() {
  console.error("entered ensureSchemaLoaded")
  yield* selectorChangeSaga(state => state.focusType, function* (focusType) {
    console.error(`focusType is ${focusType}`)
    if (focusType) {
      let loadedSchema = yield select(state => state.schemas[focusType])
      console.error(`loadedSchema is ${loadedSchema}`)
      if (!loadedSchema) {
        loadedSchema = yield call(backend.loadSchema, focusType)
        console.error(`retrieved ${loadedSchema}`)
        yield put(setPathsAction({ [`schemas.${focusType}`]: loadedSchema }))
        console.error(`put loadedSchema ${loadedSchema}`)
      }
    }
  })
}

function* rootSaga() {
  yield spawn(ensureSchemaLoaded)
}

module.exports = {
  ensureSchemaLoaded,
  rootSaga
}