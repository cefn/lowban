/* eslint-disable require-atomic-updates */
const { cloneDeep, isEqual } = require("lodash")
const { getContext, actionChannel, take, takeLatest, put, select, delay, call, spawn, fork, cancel } = require("redux-saga/effects")
const { launchPathStore } = require("../../../lib/util/redux/path")
const { defaultState, getSchemaPath, getRowPath, getListPath } = require("./store")
const { populatePathSaga, lazyPopulatePathSaga, setPathsAction, defaultPathsAction, getPathSelector } = require("../../../lib/util/redux/path")
const { selectorChangeSaga } = require("../../../lib/util/redux/watch")
const { createBackend } = require("../../../client/backend")
const { host } = require("../../../server/defaults")

//TODO prefer call to yield* (yield from) for debuggability

const {
  REFRESH_LOCAL,
  REMOVE_ITEM,
  SNOOZE_TASK,
  FULFIL_TASK,
  refreshLocalAction,
  editRecordAction,
  newRecordAction,
} = require("./action")

const saveDebounceMs = 1000

/** Causes a schema to be loaded into the store for a type. */
function* loadSchemaSaga(type) {
  const backend = yield getContext("backend")
  return yield* lazyPopulatePathSaga(getSchemaPath(type), backend.loadSchema, type)
}

/** Causes a row to be loaded into the store by type and id. */
function* loadRowSaga(type, id) {
  const backend = yield getContext("backend")
  return yield* lazyPopulatePathSaga(getRowPath(type, id), backend.loadItem, type, id)
}

/** Causes a list to be loaded into the store by name. */
function* loadListSaga(listName, listArgs = null, listFields = ["id", "label"]) {
  const backend = yield getContext("backend")
  return yield* populatePathSaga(getListPath(listName), backend.loadList, listName, listArgs, listFields)
}

/** Sagas explicitly triggered by actions */

/** Causes local lists to be refreshed in response to an explicit REFRESH_LOCAL action. */
function* handleRefreshLocalSaga() {
  const channel = yield actionChannel(REFRESH_LOCAL)
  while (true) {
    yield take(channel)
    try {
      yield* refreshListsSaga()
    }
    catch (error) {
      console.log("Error querying lists")
      console.log(error)
    }
  }
}

/** Unloads the specified item from the editor if it is currently loaded.
 * Loads the task at the top of the 'next' list instead.
*/
function* unfocusItemSaga(type, id) {
  const editor = yield select(state => state.editor)
  if (editor.type === type && editor.id === id) {
    const focusTaskId = yield select(getPathSelector(getListPath("tasksByRelevant[0].id")))
    if (focusTaskId) {
      //load relevant task if available
      yield put(editRecordAction("task", focusTaskId))
    }
    else {
      //load empty task
      yield put(newRecordAction("task"))
    }
  }
}

function* handleDeletedItemsSaga() {
  const backend = yield getContext("backend")
  const removeChannel = yield actionChannel(REMOVE_ITEM)
  while (true) {
    const removeAction = yield take(removeChannel)
    const { payload: { type, id } } = removeAction
    yield call(backend.removeItem, type, id)
    yield* unfocusItemSaga(type, id)
    yield put(refreshLocalAction())
  }
}

function* handleSnoozedTasksSaga() {
  const backend = yield getContext("backend")
  const snoozeChannel = yield actionChannel(SNOOZE_TASK)
  while (true) {
    const snoozeAction = yield take(snoozeChannel)
    const { payload: { id, until } } = snoozeAction
    yield call(backend.snoozeTask, id, until)
    yield* unfocusItemSaga("task", id)
    yield put(refreshLocalAction())
  }
}

function* handleFulfilledTasksSaga() {
  const backend = yield getContext("backend")
  const fulfilChannel = yield actionChannel(FULFIL_TASK)
  while (true) {
    const fulfilAction = yield take(fulfilChannel)
    const { payload: { id } } = fulfilAction
    yield call(backend.fulfilTask, id)
    yield* unfocusItemSaga("task", id)
    yield put(refreshLocalAction())
  }
}


/** Sagas implicitly triggered by store state change */

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
        yield put(setPathsAction({ "editor.item": cloneDeep(loadedItem) }))
      }
      else { //populate blank record
        yield put(setPathsAction({ "editor.item": {} }))
      }
    }
  })
}

function* refreshListsSaga() {
  const taskFilterString = yield select(state => state.taskFilterString)
  yield* refreshTaskListsSaga(taskFilterString)
  const tagFilterString = yield select(state => state.tagFilterString)
  yield* refreshTagListsSaga(tagFilterString)
}

function* refreshTaskListsSaga(taskFilterString) {
  taskFilterString = taskFilterString || ""
  const listFields = ["id", "label", "tagIds"]

  const filteredListNames = ["tasksByRelevant", "tasksByTime", "tasksFulfilled", "tasksAll"]
  for (const listName of filteredListNames) {
    const listArgs = { filter: taskFilterString }
    yield* loadListSaga(listName, listArgs, listFields)
  }
}

function* refreshTagListsSaga(tagFilterString) {
  tagFilterString = tagFilterString || ""
  yield* loadListSaga("filterTags", { filter: tagFilterString })
}

function* ensureFilteredTasksLoaded() {
  yield* selectorChangeSaga(state => state.taskFilterString, refreshTaskListsSaga)
}

function* ensureFilteredTagsLoaded() {
  yield* selectorChangeSaga(state => state.tagFilterString, refreshTagListsSaga)
}

function* delayedSaveSaga(type, item, delayMs) {
  const backend = yield getContext("backend")
  yield delay(delayMs)
  const savedItem = yield call(backend.saveItem, type, item)
  yield put(setPathsAction({ [getRowPath(type, savedItem.id)]: savedItem }))
  yield put(refreshLocalAction())
  return savedItem
}


function* ensureDebouncedSavesSaga() {
  //map for new saveTasks to cancel pending saveTasks if same item id (debounce)
  const forkedSaves = {}
  yield* selectorChangeSaga(state => state.editor, function* (editor, prevEditor) {
    const { type, id, item } = editor
    if (item && (Object.values(item).length > 0)) { //item is non-empty
      if (item.id) { //it's a known item
        const loadedRow = yield select(getPathSelector(getRowPath(type, item.id)))
        if (!isEqual(item, loadedRow)) { //is it different from loaded row
          const jobName = type + id
          //unschedule pending saves
          if (forkedSaves[jobName]) {
            yield cancel(forkedSaves[jobName])
            delete forkedSaves[jobName]
          }
          //schedule new save in background
          forkedSaves[jobName] = yield fork(delayedSaveSaga, type, item, saveDebounceMs)
        }
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
  //detect explicit user actions
  yield spawn(handleRefreshLocalSaga)
  yield spawn(handleDeletedItemsSaga)
  yield spawn(handleSnoozedTasksSaga)
  yield spawn(handleFulfilledTasksSaga)

  //detect specific state changes after actions
  yield spawn(ensureEditedSchemaLoaded)
  yield spawn(ensureEditedRowLoaded)
  yield spawn(ensureFilteredTagsLoaded)
  yield spawn(ensureFilteredTasksLoaded)
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
  handleDeletedItemsSaga,
  handleSnoozedTasksSaga,
  handleFulfilledTasksSaga,
  ensureEditedSchemaLoaded,
  ensureEditedRowLoaded,
  ensureFilteredTasksLoaded,
  ensureFilteredTagsLoaded,
  rootSaga,
  launchRootSaga
}