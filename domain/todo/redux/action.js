const { setPathsAction } = require("../../../lib/util/redux/path")


/** USER-INITIATED ACTIONS */

const SAVE_EDITED_ITEM = "save-edited-item"

function emptyAction(typeName) {
  return { type: typeName }
}

//TODO reintroduce payload in save action now I know saga actionChannels can have 
//a function pattern not just type: string match (e.g. can inspect payload for when saved id changes)
function saveItemAction() { return emptyAction(SAVE_EDITED_ITEM) }

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
  SAVE_EDITED_ITEM,
  saveItemAction,
  setEditedAction,
  filterTagsAction,
  filterTasksAction,
}