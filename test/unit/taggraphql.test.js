const { createDb, deleteDb, parseDb } = require("../lib/dbscaffold")
const { graphql } = require("graphql")
const { schema } = require("../../lib/taggraphql")

const exampleDb = {
  task:[
    {id:"0"}
  ]
}

{
  "task": [
    {
      "id": "0",
      "title": "Socks",
      "content": "Get size 2 school socks ",
      "tags": "@town, !soon"
    }
  ],
  "context": {
    "@town": {
      "title": "A retail centre",
      "content": "In Lancaster, Morecambe or Lunchtime in Lowry Mall in Salford"
    }
  },
  "priority": {
    "!urgent": {},
    "!priority": {},
    "!soon": {},
    "!wishlist": {}
  },
  "status": {
    "#waiting": {},
    "#done": {}
  },
  "category": {
    "house": {}
  }
}


graphql(schema, `{
  tags
}`)


