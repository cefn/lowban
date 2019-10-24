const SAVE_ITEM = "save-item"

function saveItemAction(itemType, item) {
  return {
    type: SAVE_ITEM,
    payload: {
      itemType,
      item
    }
  }
}

module.exports = {
  saveItemAction
}