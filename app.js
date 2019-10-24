const path = require("path")
const { dbFromPath } = require("./lib/lowstore")
const { hostDb: launchServer } = require("./server/host")

const db = dbFromPath(path.join(__dirname, "db.json"))
launchServer(db)