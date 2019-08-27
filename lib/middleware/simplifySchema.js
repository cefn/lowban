const { editableSchema } = require("../util/schema")

/** Serves an editableSchema JSON schema version for the type passed as req.params.typeName
 */
module.exports = async function (req, res, _next) {
    const schema = await editableSchema(req.params.typeName)
    res.json(schema)
}
