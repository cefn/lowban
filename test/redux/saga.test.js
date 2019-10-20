const { promiseDelay, promiseDelayValue } = require("../../lib/util/javascript")
const { call, select } = require("redux-saga/effects")

const { expectSaga } = require("redux-saga-test-plan")
const backend = require("../../client/backend")

import { setPathsAction, setPathsReducer } from "../../redux/store"
const {
  testing: {
    monitorSelector,
    selectorChangeSaga,
    populatePath,
    lazyPopulatePath,
    populatePathMap,
    loadSchema,
    loadRow,
    ensureFocusSchemaLoaded,
    ensureFocusRowLoaded,
    rootSaga,
  }
} = require("../../redux/saga")


function runSagaExample(chainFn, ...sagaInvocation) {
  const scenario = expectSaga(...sagaInvocation).withReducer(setPathsReducer)
  const assertionChain = chainFn(scenario)
  return assertionChain.silentRun(10) //10ms timeout, don't warn to console when saga times out
}


describe("monitorSelector() returns when store's selected state value, actions meet criteria", () => {

  const defaultMonitorInvocation = [
    monitorSelector, //saga
    state => state.hello, //selector passed to saga
    value => value === "world" //filter passed to saga
  ]

  function runMonitorExample(chainFn) {
    return runSagaExample(chainFn, ...defaultMonitorInvocation)
  }

  it("monitorSelector returns immediately if filter accepts value", async () => {
    const { effects, returnValue } = await runMonitorExample(scenario => scenario.withState({ hello: "world" }))
    //didn't 'take any action
    expect(effects.take).toBeUndefined()
    //immediately returned
    expect(returnValue).toBe("world")
  })

  it("monitorSelector returns after action if filter accepts value", async () => {
    const result = await runMonitorExample(
      scenario => scenario
        .withState({ hello: "mars" })
        .dispatch(setPathsAction({ hello: "world" }))
    )
    const { effects, returnValue } = result
    //did one 'take' of an action
    expect(effects.take).toHaveLength(1)
    //returned when action changed value to match filter
    expect(returnValue).toBe("world")
  })

  it("monitorSelector takes again after action if filter doesn't accept value", async () => {
    const result = await runMonitorExample(
      scenario => scenario
        .withState({ hello: "mars" })
        .dispatch(setPathsAction({ hello: "venus" }))
    )
    const { effects, returnValue } = result
    //did one 'take' then a second 'take' since value not matched 
    expect(effects.take).toHaveLength(2)
    //didn't return at all - was cancelled by the test framework 
    expect(returnValue).toBe("@@redux-saga/TASK_CANCEL")
  })

  it("monitorSelector blocks after non-matching action taken even if filter accepts value", async () => {
    const takePattern = "NON-EXISTENT-ACTION-TYPE"
    const result = await runSagaExample(
      scenario => scenario
        .withState({ hello: "mars" })
        .dispatch(setPathsAction({ hello: "world" })),
      ...defaultMonitorInvocation,
      takePattern
    )
    const { effects, returnValue } = result
    //still waiting on the first 'take' since no action matched it 
    expect(effects.take).toHaveLength(1)
    //didn't return at all - was cancelled by the test framework 
    expect(returnValue).toBe("@@redux-saga/TASK_CANCEL")
  })

})

describe("selectorChangeSaga() triggers callback when new value for selector not deep-equal to previous value", () => {

  function createSpySaga() {
    let invocations = []
    // eslint-disable-next-line require-yield
    const saga = function* () {
      invocations.push([...arguments])
    }
    saga.invocations = invocations
    return saga
  }

  async function spyOnSelectorChange(chainFn) {
    const spySaga = createSpySaga()
    const selectorInvocation = [selectorChangeSaga, state => state.hello, spySaga]
    const result = await runSagaExample(chainFn, ...selectorInvocation)
    return spySaga
  }

  it("Runs saga once if value was initially assigned", async () => {
    //TODO turn into spyOnSelectorChange signature, to remove duplication
    const spySaga = createSpySaga()
    const selectorInvocation = [selectorChangeSaga, state => state.hello, spySaga]
    const result = await runSagaExample(
      scenario => scenario
        .withState({ hello: "world" }),
      ...selectorInvocation
    )
    expect(spySaga.invocations[0]).toStrictEqual(["world", undefined])
    expect(spySaga.invocations.length).toBe(1)
  })

  it("Doesn't run saga if selected value not initially assigned", async () => {
    const spySaga = await spyOnSelectorChange(
      scenario => scenario
        .withState({ hello: undefined })
    )
    expect(spySaga.invocations.length).toBe(0)
  })

  it("Runs saga once if value is assigned once", async () => {
    const spySaga = await spyOnSelectorChange(
      scenario => scenario
        .withState({ hello: undefined })
        .dispatch(setPathsAction({ hello: "world" }))
    )
    const [next, prev] = ["world", undefined]
    expect(spySaga.invocations[0]).toStrictEqual([next, prev])
    expect(spySaga.invocations.length).toBe(1)
  })

  it("Runs saga twice if value becomes assigned then undefined", async () => {
    const spySaga = createSpySaga()
    const selectorInvocation = [selectorChangeSaga, state => state.hello, spySaga]
    const result = await runSagaExample(
      scenario => scenario
        .withState({ hello: undefined })
        .dispatch(setPathsAction({ hello: "world" }))
        .dispatch(setPathsAction({ hello: undefined })),
      ...selectorInvocation
    )
    expect(spySaga.invocations[0]).toStrictEqual(["world", undefined])
    expect(spySaga.invocations[1]).toStrictEqual([undefined, "world"])
    expect(spySaga.invocations.length).toBe(2)
  })

  it("Doesn't run saga if value and previous value are identical", async () => {
    const spySaga = createSpySaga()
    const selectorInvocation = [selectorChangeSaga, state => state.hello, spySaga]
    const initialState = { list: [3, 4, 5] }
    const pathMap = { list: initialState.list }
    const result = await runSagaExample(
      scenario => scenario
        .withState(initialState)
        .dispatch(setPathsAction(pathMap)),
      ...selectorInvocation
    )
    expect(spySaga.invocations.length).toBe(0)
  })

  it("Doesn't run saga if value and previous value are deep clones", async () => {
    const spySaga = createSpySaga()
    const selectorInvocation = [selectorChangeSaga, state => state.hello, spySaga]
    const result = await runSagaExample(
      scenario => scenario
        .withState({ list: [3, 4, 5] })
        .dispatch(setPathsAction({ list: [3, 4, 5] })),
      ...selectorInvocation
    )
    expect(spySaga.invocations.length).toBe(0)
  })

})

describe("populatePath() sets path with eventual value of invocation", () => {

  it("Sets shallow path to scalar value through invocation of synchronous function", async () => {
    const path = "hello"
    const valueFactory = () => "world"
    const result = await expectSaga(populatePath, path, valueFactory)
      .withReducer(setPathsReducer)
      .hasFinalState({ hello: "world" })
      .run()
  })

  it("Sets shallow path to scalar value through invocation of async function", async () => {
    const path = "hello"
    const value = "world"
    const result = await expectSaga(populatePath, path, promiseDelayValue, value, 1)
      .withReducer(setPathsReducer)
      .hasFinalState({ hello: "world" })
      .run()
  })

  it("Sets deep path to scalar value through invocation of async function", async () => {
    const path = "grandparent.parent.child"
    const value = "foo"
    const result = await expectSaga(populatePath, path, promiseDelayValue, value, 1)
      .withReducer(setPathsReducer)
      .hasFinalState({ grandparent: { parent: { child: "foo" } } })
      .run()
  })

})

describe("lazyPopulate() only sets eventual value if path non-empty", () => {

  it("Doesn't overwrite occupied shallow path with synchronous function", async () => {
    const path = "hello"
    const valueFactory = () => "world"
    const result = await expectSaga(lazyPopulatePath, path, valueFactory)
      .withReducer(setPathsReducer)
      .withState({ hello: "mars" })
      .hasFinalState({ hello: "mars" })
      .run()
  })

  it("Doesn't overwrite occupied shallow path with async function", async () => {
    const path = "hello"
    const value = "world"
    const result = await expectSaga(lazyPopulatePath, path, promiseDelayValue, value, 1)
      .withReducer(setPathsReducer, { hello: "mars" })
      .hasFinalState({ hello: "mars" })
      .run()
  })

  it("Doesn't overwrite occupied deep path with async function", async () => {
    const path = "grandparent.parent.child"
    const value = "foo"
    const result = await expectSaga(lazyPopulatePath, path, promiseDelayValue, value, 1)
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
    const result = await expectSaga(populatePathMap, promiseMap)
      .withReducer(setPathsReducer)
      .hasFinalState({ grandparent: { parent: { son: "foo", daughter: "bar" } } })
      .run()
  })

})

describe("loadSchema() loads schema for type if not yet set", () => {
  const testType = "type-x"
  const schemaMock = {} //fake schema object (tested by identity)

  it("loads schema", async () => {
    const result = await expectSaga(loadSchema, testType)
      .withReducer(setPathsReducer)
      .provide([
        [call(backend.loadSchema, testType), schemaMock], //mock the retrieval 
      ])
      .hasFinalState({ schemas: { [testType]: schemaMock } })
      .silentRun(10)

  })

})

//TODO change references to Row to be Item (since not necessarily columnar data)
describe("loadRow() loads row if not yet set", () => {
  it("loads row", async () => {
    const testType = "type-x"
    const testId = "abc"
    const testRow = { id: "abc", label: "Description" } //fake schema object (tested by identity)
    const result = await expectSaga(loadRow, testType, testId)
      .withReducer(setPathsReducer)
      .provide([
        [call(backend.loadItem, testType, testId), testRow], //mock the retrieval 
      ])
      .hasFinalState({ rows: { [testType]: { [testId]: testRow } } })
      .silentRun(10)
  })
})

describe("ensureFocusRowLoaded() monitors focus, loads row having focusType, focusId ", () => {

  it("ensureFocusRowLoaded() loads schema when type focused", async () => {
    const testType = "type-x"
    const testId = "abc"
    const testRow = { id: "abc", label: "Description" } //fake schema object (tested by identity)

    //configure saga test
    const result = await expectSaga(ensureFocusRowLoaded)
      .withReducer(setPathsReducer)
      .provide([
        [call(backend.loadItem, testType, testId), testRow], //mock the retrieval 
      ])
      .dispatch(setPathsAction({ focusType: testType, focusId: testId })) //emulate setting the focusType
      .hasFinalState({ focusType: testType, focusId: testId, rows: { [testType]: { [testId]: testRow } } })
      .silentRun(10)
  })


})


describe("ensureSchemaLoaded() monitors focusType, loads schema for focusType", () => {

  it("ensureSchemaLoaded() loads schema when type focused", async () => {
    const testType = "type-x"
    const schemaMock = {} //fake schema object (tested by identity)

    //configure saga test
    const result = await expectSaga(ensureFocusSchemaLoaded)
      .withReducer(setPathsReducer)
      .provide([
        [call(backend.loadSchema, testType), schemaMock], //mock the retrieval 
      ])
      .dispatch(setPathsAction({ focusType: testType })) //emulate setting the focusType
      .hasFinalState({ focusType: testType, schemas: { [testType]: schemaMock } })
      .silentRun(10)
  })

})
