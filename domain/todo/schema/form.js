const _ = require("lodash")
const { iterateStringTagIds } = require("../tagmodel")

function editableData(data) {
  data = _.cloneDeep(data)
  if (data.tagIds) {
    data.tagIds = data.tagIds.join(" ")
  }
  for (const [key, val] of Object.entries(data)) {
    if (val === null || val === undefined) {
      delete data[key]
    }
  }
  return data
}

function storableData(data) {
  data = _.cloneDeep(data)
  if (data.tagIds) {
    data.tagIds = [...iterateStringTagIds(data.tagIds)]
  }
  return data
}

module.exports = {
  editableData,
  storableData
}
