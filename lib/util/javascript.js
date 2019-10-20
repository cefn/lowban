function escapeRegExp(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
}

function jointComparatorFactory(comparators) {
  return function (a, b) {
    for (const comparator of comparators) {
      let result = comparator(a, b)
      if (result !== 0) {
        return result
      }
    }
    return 0
  }
}

function jointFilterFactory(filters) {
  return function (item, index, array) {
    for (const filter of filters) {
      if (!filter(item, index, array)) {
        return false
      }
    }
    return true
  }
}

/** Used for compatibility with e.g. GraphQL which requires types to have an initial capital */
function initialCapital(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const noop = () => { }

function promiseDelay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function promiseDelayValue(value, ms) {
  await promiseDelay(ms)
  return value
}

module.exports = {
  escapeRegExp,
  jointComparatorFactory,
  jointFilterFactory,
  initialCapital,
  noop,
  promiseDelay,
  promiseDelayValue
}