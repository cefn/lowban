const {
  iterateParamMatches,
  iterateParamNames,
  iteratePatternFragments,
  createParamExtractor,
} = require("../../../components/Frame")

test("Names can be extracted from a path pattern", () => {
  const pathPattern = "/list/:type/:filter"
  const actual = [...iterateParamNames(pathPattern)]
  const expected = ["type", "filter"]
  expect(actual).toEqual(expected)
})

test("Parameters can be extracted from a pathname", () => {
  const pathPattern = "/list/:type/:filter"
  const pathname = "/list/category/@home"
  const paramExtractor = createParamExtractor(pathPattern)
  const match = paramExtractor.exec(pathname)
  const actual = [match[1], match[2]]
  const expected = ["category", "@home"]
  expect(actual).toEqual(expected)
})