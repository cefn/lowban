function jointComparatorFactory(comparators) {
  return function (a, b) {
    for (const comparator of comparators) {
      let result = comparator(a, b)
      if (result !== 0) {
        return result
      }
    }
  }
}

/** Used for compatibility with e.g. GraphQL which requires types to have an initial capital */
function initialCapital(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const noop = () => { }

module.exports = {
  jointComparatorFactory,
  initialCapital,
  noop,
}