const _ = require("lodash")

function editableData(data) {
  data = _.cloneDeep(data)
  if ("tagIds" in data) {
    data.tagIds = data.tagIds.join(" ")
  }
  return data
}

function storableData(data) {
  data = _.cloneDeep(data)
  if ("tagIds" in data) {
    data.tagIds = data.tagIds.split(" ")
  }
  return data
}

module.exports = {
  editableData,
  storableData
}
