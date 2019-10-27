const { setPathsAction } = require("../../../lib/util/redux/path")

const SAVE_ITEM = "save-item"

function saveItemAction(type, item) {
  return {
    type: SAVE_ITEM,
    payload: {
      type,
      item
    }
  }
}

function focusAction(focusType, focusId) {
  return setPathsAction({
    focusType,
    focusId,
  })
}

module.exports = {
  saveItemAction,
  focusAction,
}