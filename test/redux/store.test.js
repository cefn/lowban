const { createSagaPathStore, setPathsAction } = require("../../redux/store")
const { defaultState } = require("../../redux/state")

//TODO Simplify by decoupling scenarios from defaultState (assume empty state?)

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
  expect(reduxStore.getState().types).toEqual(["priority", "status", "context", "schedule", "deadline", "category", "task"])
  reduxStore.dispatch(setPathsAction({
    "types[2]": "note",
  }))
  expect(reduxStore.getState().types).toEqual(["priority", "status", "note", "schedule", "deadline", "category", "task"])
})

test("Can set deep object paths", () => {
  expect(reduxStore.getState().ids).toEqual({})
  reduxStore.dispatch(setPathsAction({
    "ids.note": ["note-row-id"],
  }))
  expect(reduxStore.getState().ids.note).toEqual(["note-row-id"])
})

