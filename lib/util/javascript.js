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

module.exports = {
  jointComparatorFactory
}