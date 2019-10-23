import { useRef, useEffect } from 'react'
import Promise from 'bluebird'

export default function usePromiseEffect(): [
  (x0: Promise<any>) => void,
  (x0: void) => void
] {
  const promiseRef = useRef(Promise.resolve())
  useEffect(() => () => promiseRef.current.cancel(), [])
  return [
    (promise: Promise<any>) => {
      promiseRef.current = promise
    },
    () => promiseRef.current.cancel()
  ]
}
