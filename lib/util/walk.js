const _ = require("lodash")

function* iterateKeyValues(parent) {
  if (_.isPlainObject(parent)) {
    yield* Object.entries(parent)
  } else if (Array.isArray(parent)) {
    yield* parent.entries()
  }
}

function depthFirstWalk(parent, callback) {
  for (const [key, value] of iterateKeyValues(parent)) {
    //callback can delete legally
    depthFirstWalk(value, callback)
    callback(key, value, parent)
  }
}

function breadthFirstWalk(parent, callback) {
  for (const [key, value] of iterateKeyValues(parent)) {
    //callback can delete legally
    callback(key, value, parent)
  }
  for (const [key, value] of iterateKeyValues(parent)) {
    //doesn't visit deleted items
    breadthFirstWalk(value, callback)
  }
}

module.exports = {
  depthFirstWalk,
  breadthFirstWalk
}
