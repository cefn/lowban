const { call } = require("redux-saga/effects")
const { expectSaga } = require("redux-saga-test-plan")
const backend = require("../../../../client/backend")
const { setPathsAction, setPathsReducer } = require("../../../../lib/util/redux/path")


const {
  loadSchema,
  loadRow,
  ensureFocusSchemaLoaded,
  ensureFocusRowLoaded,
  rootSaga,
} = require("../../../../domain/todo/redux/saga")

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
