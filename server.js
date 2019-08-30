const path = require("path")
const express = require("express")
const expressPromiseRouter = require("express-promise-router")
const expressGraphql = require("express-graphql")

const { dbFromPath } = require("./lib/lowstore")
const { TagStore } = require("./lib/tagstore")
const { schemaFactory } = require("./lib/taggraphql")

const port = parseInt(process.env.PORT, 10) || 3000

const server = express()
const router = expressPromiseRouter()

const db = dbFromPath(path.join(__dirname, "db.json"))
const store = new TagStore(db)
const schema = schemaFactory(store)
const graphqlEndpoint = expressGraphql({
  schema,
  graphiql: true
})

const simplifySchema = require("./lib/middleware/simplifySchema")

router.use("/graphql", graphqlEndpoint)
router.get("/schema/:typeName", simplifySchema)


router.use(express.static("static"))
router.use("/", (_req, res, _next) => res.sendFile(__dirname + "/index.html"))

server.use("/", router)
server.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
