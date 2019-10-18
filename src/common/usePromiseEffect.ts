import { useRef, useEffect } from 'react'
import Promise from 'bluebird'

export default function usePromiseEffect(): [
  (x0: Promise<FlowMixed>) => void,
  (x0: void) => void
] {
  const promiseRef = useRef(Promise.resolve())
  useEffect(() => () => promiseRef.current.cancel(), [])
  return [
    (promise: Promise<FlowMixed>) => {
      promiseRef.current = promise
    },
    () => promiseRef.current.cancel()
  ]
}
