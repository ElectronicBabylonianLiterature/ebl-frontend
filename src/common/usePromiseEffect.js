// @flow
import { useRef, useEffect } from 'react'
import Promise from 'bluebird'

export default function usePromiseEffect(): [
  (Promise<mixed>) => void,
  (void) => void
] {
  const promiseRef = useRef(Promise.resolve())
  useEffect(() => () => promiseRef.current.cancel(), [])
  return [
    (promise: Promise<mixed>) => {
      promiseRef.current = promise
    },
    () => promiseRef.current.cancel()
  ]
}
