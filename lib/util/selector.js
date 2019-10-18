const get = require("lodash/get")

function getPathSelector(path) {
  return state => get(state, path)
}

module.exports = {
  getPathSelector
}