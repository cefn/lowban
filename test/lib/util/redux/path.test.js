
const { promiseDelayValue } = require("../../../../lib/util/javascript")

const { expectSaga } = require("redux-saga-test-plan")

const {
  setPathsAction,
  populatePathMapSaga,
  populatePathSaga,
  lazyPopulatePathSaga,
  setPathsReducer,
  launchPathStore,
} = require("../../../../lib/util/redux/path")

//TODO Simplify by decoupling scenarios from defaultState (assume empty state?)
const { defaultState } = require("../../../../domain/todo/redux/store") //todo remove this domain-specific reference

describe("Check behaviour of setPathsAction", () => {

  let reduxStore = null, sagaMiddleware = null
  beforeEach(() => {
    [reduxStore, sagaMiddleware] = launchPathStore(defaultState)
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


})


describe("populatePath() sets path with eventual value of invocation", () => {

  it("Sets shallow path to scalar value through invocation of synchronous function", async () => {
    const path = "hello"
    const valueFactory = () => "world"
    const result = await expectSaga(populatePathSaga, path, valueFactory)
      .withReducer(setPathsReducer)
      .hasFinalState({ hello: "world" })
      .run()
  })

  it("Sets shallow path to scalar value through invocation of async function", async () => {
    const path = "hello"
    const value = "world"
    const result = await expectSaga(populatePathSaga, path, promiseDelayValue, value, 1)
      .withReducer(setPathsReducer)
      .hasFinalState({ hello: "world" })
      .run()
  })

  it("Sets deep path to scalar value through invocation of async function", async () => {
    const path = "grandparent.parent.child"
    const value = "foo"
    const result = await expectSaga(populatePathSaga, path, promiseDelayValue, value, 1)
      .withReducer(setPathsReducer)
      .hasFinalState({ grandparent: { parent: { child: "foo" } } })
      .run()
  })

})

describe("lazyPopulate() only sets eventual value if path non-empty", () => {

  it("Doesn't overwrite occupied shallow path with synchronous function", async () => {
    const path = "hello"
    const valueFactory = () => "world"
    const result = await expectSaga(lazyPopulatePathSaga, path, valueFactory)
      .withReducer(setPathsReducer)
      .withState({ hello: "mars" })
      .hasFinalState({ hello: "mars" })
      .run()
  })

  it("Doesn't overwrite occupied shallow path with async function", async () => {
    const path = "hello"
    const value = "world"
    const result = await expectSaga(lazyPopulatePathSaga, path, promiseDelayValue, value, 1)
      .withReducer(setPathsReducer, { hello: "mars" })
      .hasFinalState({ hello: "mars" })
      .run()
  })

  it("Doesn't overwrite occupied deep path with async function", async () => {
    const path = "grandparent.parent.child"
    const value = "foo"
    const result = await expectSaga(lazyPopulatePathSaga, path, promiseDelayValue, value, 1)
      .withReducer(setPathsReducer)
      .withState({ grandparent: { parent: { child: "bar" } } })
      .hasFinalState({ grandparent: { parent: { child: "bar" } } })
      .run()
  })

})

describe("populatePathMap sets multiple paths in store state using eventual value of invocation", () => {

  it("Can handle multiple keys in a pathMap", async () => {
    const promiseMap = () => Promise.resolve({
      "grandparent.parent.son": "foo",
      "grandparent.parent.daughter": "bar"
    })
    const result = await expectSaga(populatePathMapSaga, promiseMap)
      .withReducer(setPathsReducer)
      .hasFinalState({ grandparent: { parent: { son: "foo", daughter: "bar" } } })
      .run()
  })

})

