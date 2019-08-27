const express = require("express")
const expressPromiseRouter = require("express-promise-router")
const expressGraphql = require("express-graphql")
const expressEjsLayouts = require("express-ejs-layouts")

const { dbFromPath } = require("./lib/lowstore")
const { TagStore } = require("./lib/tagstore")
const { schemaFactory } = require("./lib/taggraphql")

const simplifySchema = require("./lib/middleware/simplifySchema")
const editType = require("./lib/middleware/editType")
const listType = require("./lib/middleware/listType")

const port = parseInt(process.env.PORT, 10) || 3000

const server = express()
const router = expressPromiseRouter()

server.set("view engine", "ejs")
server.use(expressEjsLayouts)

server.use("/", router)

const db = dbFromPath("db.json")
const store = new TagStore(db)
const schema = schemaFactory(store)
const graphqlEndpoint = expressGraphql({
    schema,
    graphiql: true
})

router.use("/graphql", graphqlEndpoint)
router.get("/schema/:typeName", simplifySchema)
router.get("/edit/:typeName", editType)
router.get("/list/:typeName", listType)

router.get("/", (_req, res, _next) => res.render("index"))

router.use(express.static("static"))

server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
})
