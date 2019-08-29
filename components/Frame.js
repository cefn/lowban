import React from "react"
import { Route } from "react-router-dom"
import PropTypes from "prop-types"

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
}

/** Looks for params like :name optionally terminated by a non javascript variable character */
const pathParamPattern = /:([A-Za-z][A-Za-z0-9_]*)(?=[^A-Za-z0-9_]?)/g

function* iterateParamMatches(path) {
  yield* path.matchAll(pathParamPattern)
}

function* iterateParamNames(path) {
  for (const match of iterateParamMatches(path)) {
    yield match[1] //param name with : stripped
  }
}

function* iteratePatternFragments(path) {
  yield "^" //anchor beginning of line 
  let pos = 0
  for (const match of iterateParamMatches(path)) {
    const { index: start, [0]: clause } = match
    if (start > pos) {
      yield escapeRegExp(path.slice(pos, start)) //match param prefix  
    }
    //match param value
    yield "(.*)"
    pos = start + clause.length //skip : and name
  }
  if (pos < path.length) { //match potential param suffix
    yield escapeRegExp(path.slice(pos))
  }
  yield "$" //anchor end of line
}

function createParamExtractor(path) {
  return new RegExp([...iteratePatternFragments(path)].join(""))
}

export {
  iterateParamMatches,
  iterateParamNames,
  iteratePatternFragments,
  createParamExtractor,
}

/** Wraps child components with a non-filtering Route with bespoke location-handling.
 * If the location matches pathPrefix, then it passes the remaining pathSuffix to its children.
 */
function Frame(filterProps) {
  const { path } = filterProps
  const paramNames = [...iterateParamNames(path)]
  const paramExtractor = createParamExtractor(path)
  return <Route render={(routeProps) => {
    const { location: { pathname } } = routeProps
    //merge named params into props from Route.location.pathname using Frame.path
    const mergeProps = {}
    const match = paramExtractor.exec(pathname)
    if (match) {
      for (const [paramIndex, paramName] of paramNames.entries()) {
        mergeProps[paramName] = match[1 + paramIndex]
      }
    }
    return React.Children.map(filterProps.children, child => React.cloneElement(child, mergeProps))
  }} />
}
Frame.propTypes = {
  path: PropTypes.string.isRequired
}

export default Frame