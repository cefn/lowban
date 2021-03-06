const path = require("path")
const express = require("express")
const expressPromiseRouter = require("express-promise-router")
const expressGraphql = require("express-graphql")

const { TagStore } = require("../domain/todo/tagstore")
const { schemaFactory } = require("../domain/todo/schema/graphql")

/** Launch a server with the given lowdb instance, on the given port */
function hostDb(db, port = 3000) {
  //create graphql endpoint
  const store = new TagStore(db)
  const schema = schemaFactory(store)
  const graphqlEndpoint = expressGraphql({
    schema,
    graphiql: true
  })

  //create schema endpoint
  const { editableSchemaMiddleware } = require("../domain/todo/schema/middleware")

  const server = express()
  const router = expressPromiseRouter()

  router.use("/graphql", graphqlEndpoint)
  router.get("/schema/:typeName", editableSchemaMiddleware)

  router.use(express.static("static"))
  router.use("/", (_req, res, _next) => res.sendFile(path.resolve(__dirname, "./../client/frontend.html")))

  server.use("/", router)

  const handle = server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`) //TODO strategy to suppress console output during tests
  })

  return [handle, store]

}

module.exports = {
  hostDb
}

