const express = require("express")
const expressGraphql = require("express-graphql")

const { loadDb } = require("./lib/lowstore")
const { TagStore } = require("./lib/tagstore")
const { schemaFactory } = require("./lib/taggraphql")

const app = express()

const db = loadDb("db.json")
const store = new TagStore(db)
const schema = schemaFactory(store)

app.use(
  "/graphql",
  expressGraphql({
    schema,
    graphiql: true
  })
)

app.listen(4000)
