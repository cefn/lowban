const { defaultState } = require("../../redux/config")
const { createSagaPathStore, setPathsAction, setPathsPromisedSaga } = require("../../redux/store")

function promiseTimeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

let reduxStore = null, sagaMiddleware = null
beforeEach(() => {
  [reduxStore, sagaMiddleware] = createSagaPathStore(defaultState)
})

test("Can set a shallow path to a value", () => {
  expect(reduxStore.getState().focusId).toBeNull()
  const focusId = "id-in-focus"
  reduxStore.dispatch(setPathsAction({
    "focusId": focusId
  }))
  expect(reduxStore.getState().focusId).toEqual(focusId)
})

test("Can set multiple shallow paths to values", () => {
  expect(reduxStore.getState().focusId).toBeNull()
  expect(reduxStore.getState().focusType).toBeNull()
  reduxStore.dispatch(setPathsAction({
    "focusId": "id-in-focus",
    "focusType": "type-in-focus"
  }))
  expect(reduxStore.getState().focusId).toEqual("id-in-focus")
  expect(reduxStore.getState().focusType).toEqual("type-in-focus")
})

test("Can set deep array paths", () => {
  expect(reduxStore.getState().types).toEqual(["task", "tag"])
  reduxStore.dispatch(setPathsAction({
    "types[2]": "note",
  }))
  expect(reduxStore.getState().types).toEqual(["task", "tag", "note"])
})

test("Can set deep object paths", () => {
  expect(reduxStore.getState().ids).toEqual({})
  reduxStore.dispatch(setPathsAction({
    "ids.note": ["note-row-id"],
  }))
  expect(reduxStore.getState().ids.note).toEqual(["note-row-id"])
})

test("Can set path to eventual promise value", async () => {
  //check empty
  expect(reduxStore.getState().rows).toEqual({})
  //define row
  const row = { id: "promised-row-id", title: "promised-row-title" }
  //creates delayed promise for pathMap to insert the row into 'rows'
  const promiseRowPathMap = async () => {
    await promiseTimeout(1000)
    return {
      "rows.promised-row-id": row
    }
  }
  //launch the saga with the promise factory
  const sagaTask = sagaMiddleware.run(setPathsPromisedSaga, promiseRowPathMap)
  //wait for saga to complete
  await sagaTask.toPromise()
  //check store state
  expect(reduxStore.getState().rows["promised-row-id"]).toEqual(row)
})