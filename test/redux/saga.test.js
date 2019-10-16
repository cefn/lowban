const { call } = require("redux-saga/effects")

const { expectSaga } = require("redux-saga-test-plan")
const backend = require("../../client/backend")

import { setPathsAction, setPathsReducer } from "../../redux/store"
const { ensureSchemaLoaded } = require("../../redux/saga")

describe("ensureSchemaLoaded() monitors focusType", () => {

  it("ensureSchemaLoaded() loads schema when a type is focused", () => {
    const testTypeSchemaMock = new Object()
    const testType = "test-focus-type"
    const initialState = { focusType: null, schemas: {} }

    return expectSaga(ensureSchemaLoaded)
      .withReducer(setPathsReducer, initialState)
      .provide([
        [call(backend.loadSchema, testType), testTypeSchemaMock],
      ])
      .put(setPathsAction({ [`schemas.${testType}`]: testTypeSchemaMock }))
      .dispatch(setPathsAction({ focusType: testType }))
      .run()
  })

})
