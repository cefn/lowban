const path = require("path")
const { dbFromPath } = require("./lib/lowstore")
const { hostDb } = require("./server/host")

const dbPath = process.argv.length > 2 ?
  process.argv[2] :
  path.join(__dirname, "db.json")

const db = dbFromPath(dbPath)
hostDb(db)