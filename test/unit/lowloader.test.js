const { writeFileSync, readFileSync, unlinkSync } = require("fs");
const { loadDb } = require("../../lib/lowloader");

const defaultDbPath = "/tmp/db.json";

/** Remove db JSON file from disk */
function deleteDb(testDbPath = defaultDbPath) {
  unlinkSync(testDbPath);
}

/** Create db JSON file on disk */
function createDb(obj, testDbPath = defaultDbPath) {
  writeFileSync(testDbPath, JSON.stringify(obj));
  return loadDb(testDbPath);
}

/** Parse the JSON file direct from disk */
function parseDb(testDbPath = defaultDbPath) {
  return JSON.parse(readFileSync(testDbPath, "utf-8"));
}

beforeAll(() => {
  deleteDb();
});

test("Queries load values from db file", () => {
  let db = createDb({ fieldName: "fieldValue" });
  expect(db.get("fieldName").value()).toEqual("fieldValue");
});

test("Lodash transformation chain followed by write is reflected in db file", () => {
  let db = createDb({ fieldName: "fieldValue" });
  db.set("fieldName", "otherValue").write();
  expect(parseDb()).toEqual({ fieldName: "otherValue" });
});
