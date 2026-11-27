import { useCallback, useLayoutEffect, useRef } from 'react'

export default function useStableCallback<
  Parameters extends readonly unknown[],
  Result,
>(
  callback: (...parameters: Parameters) => Result,
): (...parameters: Parameters) => Result {
  const callbackRef = useRef(callback)

  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  return useCallback(
    (...parameters: Parameters): Result => callbackRef.current(...parameters),
    [],
  )
}
