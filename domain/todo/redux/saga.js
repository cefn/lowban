/* eslint-disable require-atomic-updates */
const { getContext, actionChannel, select, take, put, delay, call, spawn, fork, cancel } = require("redux-saga/effects")
const { launchPathStore } = require("../../../lib/util/redux/path")
const { defaultState, getSchemaPath, getRowPath, getListPath } = require("./store")
const { populatePathSaga, lazyPopulatePathSaga, setPathsAction, defaultPathsAction } = require("../../../lib/util/redux/path")
const { selectorChangeSaga } = require("../../../lib/util/redux/watch")
const { createBackend } = require("../../../client/backend")
const { host } = require("../../../server/defaults")
const { SAVE_EDITED_ITEM } = require("./action")

const saveDebounceMs = 10000

function* loadSchemaSaga(type) {
  const backend = yield getContext("backend")
  return yield* lazyPopulatePathSaga(getSchemaPath(type), backend.loadSchema, type)
}

function* loadRowSaga(type, id) {
  const backend = yield getContext("backend")
  return yield* lazyPopulatePathSaga(getRowPath(type, id), backend.loadItem, type, id)
}

function* loadListSaga(listName, listArgs = null, listFields = ["id", "label"]) {
  const backend = yield getContext("backend")
  return yield* populatePathSaga(getListPath(listName), backend.loadList, listName, listArgs, listFields)
}

function* ensureEditedSchemaLoaded() {
  yield* selectorChangeSaga(state => state.editor.type, function* (type) {
    if (type) {
      yield* loadSchemaSaga(type)
    }
  })
}

function* ensureEditedRowLoaded() {
  yield* selectorChangeSaga(state => state.editor, function* ({ type, id, item }) {
    if (type && id) {
      if ((!item) || (item.id !== id)) {
        const loadedItem = yield* loadRowSaga(type, id)
        yield put(setPathsAction({ "editor.item": loadedItem }))
      }
    }
  })
}

function* ensureFilterTaskListLoaded() {
  yield* selectorChangeSaga(state => state.taskFilterString, function* (taskFilterString) {
    taskFilterString = taskFilterString || ""
    yield* loadListSaga("filterTask", { filter: taskFilterString })
  })
}

function* ensureFilterTagListLoaded() {
  yield* selectorChangeSaga(state => state.tagFilterString, function* (tagFilterString) {
    tagFilterString = tagFilterString || ""
    yield* loadListSaga("filterTag", { filter: tagFilterString })
  })
}

function* delayedSaveSaga(type, item, delayMs) {
  const backend = yield getContext("backend")
  yield delay(delayMs)
  const savedItem = yield call(backend.saveItem, type, item)
  yield put(setPathsAction({ [getRowPath(type, savedItem.id)]: savedItem }))
  return savedItem
}

//TODO use debounce directly but with function pattern to ensure last save of a
//given item isn't lost
function* ensureDebouncedSavesSaga() {
  //map for new saveTasks to cancel pending saveTasks if same item id (debounce)
  const saveTasks = {}
  //channel all save actions
  const saveChannel = yield actionChannel(SAVE_EDITED_ITEM)
  while (true) {
    //next save event
    yield take(saveChannel)
    //get editor state
    const editor = yield select(state => state.editor)
    const { type, id, item } = editor
    if (!id) { //anonymous item
      //save immediately, await id
      const savedItem = yield call(delayedSaveSaga, type, item, 0)
      //record id in editor record
      yield put(defaultPathsAction({
        "editor.id": savedItem.id,
        "editor.item.id": savedItem.id
      }))
      //await next save event
      continue
    }
    else { //known item
      const jobName = type + id
      //unschedule pending saves
      if (saveTasks[jobName]) {
        yield cancel(saveTasks[jobName])
        delete saveTasks[jobName]
      }
      //schedule new save
      saveTasks[jobName] = yield fork(delayedSaveSaga, type, item, saveDebounceMs)
    }
  }
}

function* rootSaga() {
  yield spawn(ensureEditedSchemaLoaded)
  yield spawn(ensureEditedRowLoaded)
  yield spawn(ensureFilterTaskListLoaded)
  yield spawn(ensureFilterTagListLoaded)
  yield spawn(ensureDebouncedSavesSaga)
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
  ensureEditedSchemaLoaded,
  ensureEditedRowLoaded,
  ensureFilterTaskListLoaded,
  ensureFilterTagListLoaded,
  rootSaga,
  launchRootSaga
}