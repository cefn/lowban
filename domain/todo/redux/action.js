const { setPathsAction } = require("../../../lib/util/redux/path")

const REFRESH_LOCAL = "refresh-local"
const REMOVE_ITEM = "remove-item"
const SNOOZE_TASK = "snooze-task"
const FULFIL_TASK = "fulfil-task"

/** SAGA-HANDLED ACTIONS */

function refreshLocalAction() {
  return {
    type: REFRESH_LOCAL
  }
}

function removeItemAction(type, id) {
  return {
    type: REMOVE_ITEM,
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

function newRecordAction(type) {
  return editRecordAction(type, undefined)
}

function editRecordAction(type, id) {
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
  REFRESH_LOCAL,
  REMOVE_ITEM,
  SNOOZE_TASK,
  FULFIL_TASK,
  refreshLocalAction,
  removeItemAction,
  snoozeTaskAction,
  fulfilTaskAction,
  saveItemAction,
  newRecordAction,
  editRecordAction,
  filterTagsAction,
  filterTasksAction,
}