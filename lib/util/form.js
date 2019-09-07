const _ = require("lodash")

function editableData(data) {
  data = _.cloneDeep(data)
  if (data.tagIds) {
    data.tagIds = data.tagIds.join(" ")
  }
  return data
}

function storableData(data) {
  data = _.cloneDeep(data)
  if (data.tagIds) {
    data.tagIds = data.tagIds.trim().split(/\\s*s/)
  }
  return data
}

module.exports = {
  editableData,
  storableData
}
