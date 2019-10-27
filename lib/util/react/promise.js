const { useState, useEffect } = require("react")

/** Draft implementation of a usePromise hook */
function usePromise(initialPromise) {
  const [promise, setPromise] = useState(initialPromise || null)
  const [pending, setPending] = useState()
  const [value, setValue] = useState()
  const [error, setError] = useState()
  const noop = () => { }
  useEffect(() => {
    let valueSetter = setValue
    let errorSetter = setError
    let pendingSetter = setPending
    if (promise) {
      pendingSetter(true)
      valueSetter(undefined)
      errorSetter(undefined)
      promise.then((val) => {
        pendingSetter(false)
        valueSetter(val)
      }).catch((err) => {
        pendingSetter(false)
        errorSetter(err)
      })
    }
    return () => { //disable previous then,catch
      pendingSetter = noop
      valueSetter = noop
      errorSetter = noop
    }
  }, [promise])
  return [value, setPromise, error, promise, pending]
}

module.exports = {
  usePromise
}