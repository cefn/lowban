/* eslint-disable require-atomic-updates */
const isEqual = require("lodash/isEqual")
const cloneDeep = require("lodash/cloneDeep")
const { take, select, actionChannel } = require("redux-saga/effects")

/** Returns as soon as a selected value satisfies a filter. 
 * If filter not immediately satisfied, checks again after every redux action. */
function* monitorSelector(valueSelector, valueFilter, eventChannel) {
  while (true) {
    const nextValue = yield select(valueSelector)
    if (valueFilter(nextValue)) {
      return nextValue
    }
    yield take(eventChannel)
  }
}

/** Yields to saga(next) if selector begins with a defined value. Subsequently, 
 * yields to saga(next, prev) whenever selector changed from previous known value (not deep equal). */
function* selectorChangeSaga(selector, saga) {
  let monitorChannel = yield actionChannel("*")
  let previous
  while (true) {
    const next = yield* monitorSelector(selector, next => !isEqual(next, previous), monitorChannel)
    yield* saga(next, previous)
    previous = cloneDeep(next)
  }
}

module.exports = {
  monitorSelector,
  selectorChangeSaga
}
