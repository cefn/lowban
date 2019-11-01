const { expectSaga } = require("redux-saga-test-plan")
const { setPathsAction, setPathsReducer } = require("../../../../lib/util/redux/path")

const {
  monitorSelector,
  selectorChangeSaga,
} = require("../../../../lib/util/redux/watch")

function runSagaExample(scenarioDecorator, ...sagaInvocation) {
  const scenario = expectSaga(...sagaInvocation).withReducer(setPathsReducer)
  const assertionChain = scenarioDecorator(scenario)
  return assertionChain.silentRun(10) //10ms timeout, don't warn to console when saga times out
}

describe("monitorSelector() returns when store's selected state value, actions meet criteria", () => {

  function runMonitorExample(scenarioDecorator, patternOrChannel = "*") {
    const monitorInvocation = [
      monitorSelector, //saga
      state => state.hello, //selector passed to monitorSelector
      value => value === "world", //filter passed to monitorSelector,
      patternOrChannel,
    ]
    return runSagaExample(scenarioDecorator, ...monitorInvocation)
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
    const result = await runMonitorExample(
      scenario => scenario
        .withState({ hello: "mars" })
        .dispatch(setPathsAction({ hello: "world" })),
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

  async function spyOnSelectorChange(scenarioDecorator) {
    const spySaga = createSpySaga()
    const selectorInvocation = [selectorChangeSaga, state => state.hello, spySaga]
    const result = await runSagaExample(scenarioDecorator, ...selectorInvocation)
    return spySaga
  }

  it("Doesn't run saga if selected value not initially assigned", async () => {
    const spySaga = await spyOnSelectorChange(
      scenario => scenario
        .withState({ hello: undefined })
    )
    expect(spySaga.invocations.length).toBe(0)
  })

  it("Runs saga once if value was initially assigned", async () => {
    const spySaga = await spyOnSelectorChange(
      scenario => scenario
        .withState({ hello: "world" })
    )
    expect(spySaga.invocations[0]).toStrictEqual(["world", undefined])
    expect(spySaga.invocations.length).toBe(1)
  })

  it("Runs saga once if value was undefined, then is assigned once", async () => {
    const spySaga = await spyOnSelectorChange(
      scenario => scenario
        .withState({ hello: undefined })
        .dispatch(setPathsAction({ hello: "world" }))
    )
    const [next, prev] = ["world", undefined]
    expect(spySaga.invocations[0]).toStrictEqual([next, prev])
    expect(spySaga.invocations.length).toBe(1)
  })

  it("Runs saga twice if value is assigned then made undefined", async () => {
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


