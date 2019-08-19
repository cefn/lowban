const _ = require("lodash")

function* iterateKeyValues(parent) {
  let entries
  if (_.isPlainObject(parent)) {
    yield* Object.entries(parent)
  } else if (Array.isArray(parent)) {
    yield* parent.entries()
  }
}

function depthFirstWalk(parent, callback, ancestorPath) {
  if (!ancestorPath) {
    ancestorPath = []
  }
  for (const [key, value] of iterateKeyValues(parent)) {
    const ancestorPathClone = [...ancestorPath]
    ancestorPathClone.push(key)
    depthFirstWalk(value, callback, ancestorPathClone)
    callback(key, value, parent, ancestorPathClone)
  }
}

function breadthFirstWalk(parent, callback, ancestorPath) {
  if (!ancestorPath) {
    ancestorPath = []
  }
  const entries = [...iterateKeyValues(parent)]
  for (const [key, value] of entries) {
    const ancestorPathClone = [...ancestorPath]
    ancestorPathClone.push(key)
    callback(key, value, parent, ancestorPathClone)
  }
  for (const [key, value] of entries) {
    const ancestorPathClone = [...ancestorPath]
    ancestorPathClone.push(key)
    breadthFirstWalk(value, callback, ancestorPathClone)
  }
}

module.exports = {
  depthFirstWalk,
  breadthFirstWalk
}
