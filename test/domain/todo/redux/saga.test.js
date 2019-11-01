const { call, getContext } = require("redux-saga/effects")
const { expectSaga } = require("redux-saga-test-plan")
const { setPathsAction, setPathsReducer } = require("../../../../lib/util/redux/path")


const {
  loadSchemaSaga,
  loadRowSaga,
  loadListSaga,
  ensureEditedSchemaLoaded,
  ensureEditedRowLoaded,
  ensureFilterTaskListLoaded,
  ensureFilterTagListLoaded,
  rootSaga,
  launchRootSaga
} = require("../../../../domain/todo/redux/saga")

const noop = () => { }
const backend = {
  loadSchema: noop,
  loadIds: noop,
  loadItem: noop,
  loadList: noop,
  saveItem: noop
}


describe("loadSchema() loads schema for type if not yet set", () => {
  const testType = "type-x"
  const schemaMock = {} //fake schema object (tested by identity)

  it("loads schema", async () => {
    const result = await expectSaga(loadSchemaSaga, testType)
      .withReducer(setPathsReducer)
      .provide([
        [getContext("backend"), backend],
        [call(backend.loadSchema, testType), schemaMock], //mock the retrieval 
      ])
      .hasFinalState({ schemas: { [testType]: schemaMock } })
      .silentRun(10)

  })

})

//TODO change references to Row to be Item (since not necessarily columnar data)
describe("loadItem() loads row if not yet set", () => {
  it("loads row", async () => {
    const testType = "type-x"
    const testId = "abc"
    const testRow = { id: "abc", label: "Description" } //fake schema object (tested by identity)
    const result = await expectSaga(loadRowSaga, testType, testId)
      .withReducer(setPathsReducer)
      .provide([
        [getContext("backend"), backend],
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
    const result = await expectSaga(ensureEditedRowLoaded)
      .withReducer(setPathsReducer)
      .provide([
        [getContext("backend"), backend],
        [call(backend.loadItem, testType, testId), testRow], //mock the retrieval 
      ])
      .dispatch(setPathsAction({ editor: { type: testType, id: testId } })) //emulate setting the focusType
      .hasFinalState({ editor: { type: testType, id: testId, item: testRow }, rows: { [testType]: { [testId]: testRow } } })
      .silentRun(10)
  })


})


describe("ensureSchemaLoaded() monitors focusType, loads schema for focusType", () => {

  it("ensureSchemaLoaded() loads schema when type focused", async () => {
    const testType = "type-x"
    const schemaMock = {} //fake schema object (tested by identity)
    const initialState = { editor: { type: undefined } }
    //configure saga test
    const result = await expectSaga(ensureEditedSchemaLoaded)
      .withReducer(setPathsReducer, initialState)
      .provide([
        [getContext("backend"), backend],
        [call(backend.loadSchema, testType), schemaMock], //mock the retrieval 
      ])
      .dispatch(setPathsAction({ editor: { type: testType } })) //emulate setting the focusType
      .hasFinalState({ editor: { type: testType, }, schemas: { [testType]: schemaMock } })
      .silentRun(10)
  })

})
