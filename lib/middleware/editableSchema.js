const { editableSchema } = require("../util/schema")

async function editableSchemaMiddleware(req, res, next) {
  const schema = await editableSchema(req.params.typeName)
  res.json(schema)
}

module.exports = editableSchemaMiddleware
