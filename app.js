const path = require("path")
const { dbFromPath } = require("./lib/lowstore")
const { launchServer } = require("./server")

const db = dbFromPath(path.join(__dirname, "db.json"))
launchServer(db)