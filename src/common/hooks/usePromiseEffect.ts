import { useCallback, useRef, useEffect } from 'react'
import Promise from 'bluebird'

export default function usePromiseEffect<T = unknown>(): [
  (promise: Promise<T>) => void,
  () => void,
] {
  const promiseRef = useRef<Promise<T>>()
  useEffect(() => (): void => promiseRef.current?.cancel?.(), [])
  const setPromise = useCallback((promise: Promise<T>): void => {
    promiseRef.current = promise
  }, [])
  const cancelPromise = useCallback(
    (): void => promiseRef.current?.cancel?.(),
    [],
  )
  return [setPromise, cancelPromise]
}
