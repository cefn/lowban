const { setPathsAction } = require("../../../lib/util/redux/path")


/** USER-INITIATED ACTIONS */

function saveItemAction(item) {
  return setPathsAction({
    "editor.item": item
  })
}

/** STORE MANIPULATION ACTIONS */

function setEditedAction(type, id) {
  return setPathsAction({
    "editor.type": type,
    "editor.id": id,
  })
}

function filterTagsAction(tagFilterString) {
  return setPathsAction({
    tagFilterString
  })
}

function filterTasksAction(taskFilterString) {
  return setPathsAction({
    taskFilterString
  })
}

module.exports = {
  saveItemAction,
  setEditedAction,
  filterTagsAction,
  filterTasksAction,
}