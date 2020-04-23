import { useRef, useEffect } from 'react'
import Promise from 'bluebird'

export default function usePromiseEffect<T = any>(): [
  (promise: Promise<T>) => void,
  () => void
] {
  const promiseRef = useRef<Promise<T>>()
  useEffect(() => (): void => promiseRef.current?.cancel(), [])
  return [
    (promise: Promise<T>): void => {
      promiseRef.current = promise
    },
    (): void => promiseRef.current?.cancel()
  ]
}
