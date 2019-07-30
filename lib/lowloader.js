const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

function loadDb (dbPath) {
  const adapter = new FileSync(dbPath)
  const db = lowdb(adapter)
  return db
}

module.exports = {
  loadDb
}
