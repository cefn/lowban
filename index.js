const express = require("express")
const expressGraphql = require("express-graphql")

const { schemaFactory } = require("./lib/todographql")

const app = express()

const db = loadDb("db.json")

const schema = schemaFactory(db)

app.use(
  "/graphql",
  expressGraphql({
    schema,
    graphiql: true
  })
)

app.listen(4000)
