const { writeFileSync, readFileSync, unlinkSync } = require("fs")

const defaultDbPath = "/tmp/db.json"

/** Remove db JSON file from disk */
function deleteDb(testDbPath = defaultDbPath) {
  unlinkSync(testDbPath)
}

/** Create db JSON file on disk */
function createDb(obj, testDbPath = defaultDbPath) {
  writeFileSync(testDbPath, JSON.stringify(obj))
  return loadDb(testDbPath)
}

/** Parse the JSON file direct from disk */
function parseDb(testDbPath = defaultDbPath) {
  return JSON.parse(readFileSync(testDbPath, "utf-8"))
}
