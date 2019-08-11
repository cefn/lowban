const { writeFileSync, readFileSync, unlinkSync } = require("fs")
const lowdb = require("lowdb")
const Memory = require("lowdb/adapters/Memory")
const { loadDb, LowStore } = require("../../../lib/lowstore")

const defaultDbPath = "/tmp/db.json"

/** Remove db JSON file from disk */
function deleteFileDb(testDbPath = defaultDbPath) {
  unlinkSync(testDbPath)
}

/** Create db JSON file on disk */
function createFileDb(obj, testDbPath = defaultDbPath) {
  writeFileSync(testDbPath, JSON.stringify(obj))
  return loadDb(testDbPath)
}

/** Parse the JSON file direct from disk without lowstore */
function parseFileDb(testDbPath = defaultDbPath) {
  return JSON.parse(readFileSync(testDbPath, "utf-8"))
}

/** Provide a db having the specified content, for which write HAS NO EFFECT */
function createMemoryDb(tree) {
  return lowdb(new Memory()).defaults(tree)
}

module.exports = {
  deleteFileDb,
  createFileDb,
  parseFileDb,
  createMemoryDb
}
