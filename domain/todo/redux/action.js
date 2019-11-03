const { setPathsAction } = require("../../../lib/util/redux/path")

const DELETE_ITEM = "delete-item"
const SNOOZE_TASK = "snooze-task"
const FULFIL_TASK = "fulfil-task"

/** SAGA-HANDLED ACTIONS */

function deleteItemAction(type, id) {
  return {
    type: DELETE_ITEM,
    payload: {
      type,
      id
    }
  }
}

function snoozeTaskAction(id, until) {
  return {
    type: SNOOZE_TASK,
    payload: {
      id,
      until
    }
  }
}

function fulfilTaskAction(id) {
  return {
    type: FULFIL_TASK,
    payload: {
      id
    }
  }
}

/** STORE MANIPULATION ACTIONS */

function saveItemAction(item) {
  return setPathsAction({
    "editor.item": item
  })
}

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
  deleteItemAction,
  snoozeTaskAction,
  fulfilTaskAction,
  saveItemAction,
  setEditedAction,
  filterTagsAction,
  filterTasksAction,
}