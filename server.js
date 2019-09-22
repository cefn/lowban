const express = require("express")
const expressPromiseRouter = require("express-promise-router")
const expressGraphql = require("express-graphql")

const { TagStore } = require("./lib/tagstore")
const { schemaFactory } = require("./lib/taggraphql")

function launchServer(db, port = 3000) {
  //create graphql endpoint
  const store = new TagStore(db)
  const schema = schemaFactory(store)
  const graphqlEndpoint = expressGraphql({
    schema,
    graphiql: true
  })

  //create schema endpoint
  const simplifySchema = require("./lib/middleware/simplifySchema")

  const server = express()
  const router = expressPromiseRouter()

  router.use("/graphql", graphqlEndpoint)
  router.get("/schema/:typeName", simplifySchema)

  router.use(express.static("static"))
  router.use("/", (_req, res, _next) => res.sendFile(__dirname + "/index.html"))

  server.use("/", router)

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

}

module.exports = {
  launchServer
}

