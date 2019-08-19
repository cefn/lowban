const express = require("express")
const expressGraphql = require("express-graphql")

const { loadDb } = require("./lib/lowstore")
const { TagStore } = require("./lib/tagstore")
const { schemaFactory } = require("./lib/taggraphql")

const next = require("next")

const editableSchema = require("./lib/middleware/editableSchema")

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  const db = loadDb("db.json")
  const store = new TagStore(db)
  const schema = schemaFactory(store)
  server.use(
    "/graphql",
    expressGraphql({
      schema,
      graphiql: true
    })
  )

  server.get("/schema/:typeName", editableSchema)

  server.get("*", (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
