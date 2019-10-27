const path = require("path")
const { dbFromPath } = require("./lib/lowstore")
const { hostDb } = require("./server/host")

const db = dbFromPath(path.join(__dirname, "db.json"))
hostDb(db)