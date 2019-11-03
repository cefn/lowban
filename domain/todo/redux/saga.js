/* eslint-disable require-atomic-updates */
const { getContext, put, delay, call, spawn, fork, cancel } = require("redux-saga/effects")
const { launchPathStore } = require("../../../lib/util/redux/path")
const { defaultState, getSchemaPath, getRowPath, getListPath } = require("./store")
const { populatePathSaga, lazyPopulatePathSaga, setPathsAction, defaultPathsAction } = require("../../../lib/util/redux/path")
const { selectorChangeSaga } = require("../../../lib/util/redux/watch")
const { createBackend } = require("../../../client/backend")
const { host } = require("../../../server/defaults")

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
  yield* selectorChangeSaga(state => state.editor, function* (nextEditor, prevEditor) {
    const { type, id, item } = nextEditor

    const loadRow = (
      ((!prevEditor) || (id !== prevEditor.id)) &&   //id changed
      ((!item) || (item.id !== id)) //item doesn't match id
    )

    if (loadRow) {
      if (id) { //load known record
        const loadedItem = yield* loadRowSaga(type, id)
        yield put(setPathsAction({ "editor.item": loadedItem }))
      }
      else { //populate blank record
        yield put(setPathsAction({ "editor.item": {} }))
      }
    }
  })
}

function* ensureFilteredTasksLoaded(listName) {
  yield* selectorChangeSaga(state => state.taskFilterString, function* (taskFilterString) {
    taskFilterString = taskFilterString || ""
    yield* loadListSaga(listName, { filter: taskFilterString }, ["id", "label", "tagIds"])
  })
}

function* ensureFilteredTagsLoaded() {
  yield* selectorChangeSaga(state => state.tagFilterString, function* (tagFilterString) {
    tagFilterString = tagFilterString || ""
    yield* loadListSaga("filterTags", { filter: tagFilterString })
  })
}

function* delayedSaveSaga(type, item, delayMs) {
  const backend = yield getContext("backend")
  yield delay(delayMs)
  const savedItem = yield call(backend.saveItem, type, item)
  yield put(setPathsAction({ [getRowPath(type, savedItem.id)]: savedItem }))
  return savedItem
}


function* ensureDebouncedSavesSaga() {
  //map for new saveTasks to cancel pending saveTasks if same item id (debounce)
  const forkedSaves = {}
  yield* selectorChangeSaga(state => state.editor, function* (editor) {
    const { type, id, item } = editor
    if (item && (Object.values(item).length > 0)) { //item is non-empty
      if (item.id) { //it's a known item
        const jobName = type + id
        //unschedule pending saves
        if (forkedSaves[jobName]) {
          yield cancel(forkedSaves[jobName])
          delete forkedSaves[jobName]
        }
        //schedule new save in background
        forkedSaves[jobName] = yield fork(delayedSaveSaga, type, item, saveDebounceMs)
      }
      else { //it's an anonymous item
        //save immediately, block and await id
        const savedItem = yield call(delayedSaveSaga, type, item, 0)
        //set id in editor record
        yield put(defaultPathsAction({
          "editor.id": savedItem.id,
          "editor.item.id": savedItem.id
        }))
      }
    }
  })
}

function* rootSaga() {
  yield spawn(ensureEditedSchemaLoaded)
  yield spawn(ensureEditedRowLoaded)
  yield spawn(ensureFilteredTagsLoaded)
  yield spawn(ensureFilteredTasksLoaded, "tasksByRelevant")
  yield spawn(ensureFilteredTasksLoaded, "tasksByTime")
  yield spawn(ensureFilteredTasksLoaded, "tasksFulfilled")
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
  ensureFilteredTasksLoaded,
  ensureFilteredTagsLoaded,
  rootSaga,
  launchRootSaga
}