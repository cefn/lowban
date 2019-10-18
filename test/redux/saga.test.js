const { call } = require("redux-saga/effects")

const { expectSaga } = require("redux-saga-test-plan")
const backend = require("../../client/backend")

import { setPathsAction, setPathsReducer } from "../../redux/store"
const {
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
  }
} = require("../../redux/saga")

describe("monitorSelector() unblocks when selected value and actions meet filter criteria", () => {

  it("monitorSelector returns immediately if filter accepts value", () => {
    expectSaga(monitorSelector, state => state.hello, value => value === "world")
      .withReducer(setPathsReducer, { hello: "world" })
      .returns("world")
      .run()
  })

  it("monitorSelector returns after action if filter accepts value", () => {
    expectSaga(monitorSelector, state => state.hello, value => value === "world")
      .withReducer(setPathsReducer, { hello: "mars" })
      .dispatch(setPathsAction({ hello: "world" }))
      .not.take("*")
      .returns("world")
      .run()
  })

  it("monitorSelector takes again after action if filter doesn't accept value", () => {
    expectSaga(monitorSelector, state => state.hello, value => value === "world")
      .withReducer(setPathsReducer, { hello: "mars" })
      .dispatch(setPathsAction({ hello: "venus" }))
      .take("*")
      .run()
  })

  it("monitorSelector blocks after non-matching action taken even if filter accepts value", () => {
    const takePattern = "NON-EXISTENT-ACTION-TYPE"
    expectSaga(monitorSelector, state => state.hello, value => value === "world", takePattern)
      .withReducer(setPathsReducer, { hello: "mars" })
      .dispatch(setPathsAction({ hello: "world" }))
      .take("*")
      .run()
  })

})

describe("selectorChangeSaga() unblocks when selector's new value not deep-equal to previous value", () => {

})

describe("populate() sets path in store state with eventual value of invocation", () => {

})

describe("lazyPopulate() sets path in store state with eventual value of invocation if nothing at that path", () => {

})

describe("loadSchema() loads schema for type if not yet set", () => {

})

describe("loadRow() loads row if not yet set", () => {

})

describe("ensureFocusRowLoaded() monitors focus, loads row having focusType, focusId ", () => {

})


describe("ensureSchemaLoaded() monitors focusType, loads schema for focusType", () => {

  it("ensureSchemaLoaded() loads schema when type focused", async () => {
    const testType = "type-x"
    const schemaMock = {} //fake schema object (tested by identity)

    //configure saga test
    const { storeState } = await expectSaga(ensureFocusSchemaLoaded)
      //store reducer and initial state
      .withReducer(setPathsReducer, { focusType: null, schemas: {} })
      //mock the retrieval 
      .provide([
        [call(backend.loadSchema, testType), schemaMock],
      ])
      //emulate setting the focusType
      .dispatch(setPathsAction({ focusType: testType }))
      //wait for saga to complete
      .run()

    //schema should be set
    expect(storeState.schemas[testType]).toBe(schemaMock)
  })

})
