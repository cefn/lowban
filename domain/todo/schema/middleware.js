const { editableSchema } = require("./transform")

/** Serves an editableSchema JSON schema version for the type passed as req.params.typeName */
async function editableSchemaMiddleware(req, res, _next) {
  const schema = await editableSchema(req.params.typeName, req.params.domain)
  res.json(schema)
}

module.exports = {
  editableSchemaMiddleware
}