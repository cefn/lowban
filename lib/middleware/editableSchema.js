const { editableSchema } = require("../util/schema")

/** Serves an editableSchema JSON schema version for the type passed as req.params.typeName
 */
async function editableSchemaMiddleware(req, res, next) {
  const schema = await editableSchema(req.params.typeName)
  res.json(schema)
}

module.exports = editableSchemaMiddleware
