import { useRef, useEffect, useCallback } from 'react'

export default function usePromiseEffect(): [
  (operation: (signal: AbortSignal) => Promise<unknown>) => void,
  () => void,
] {
  const controllerRef = useRef<AbortController | null>(null)
  const cancel = useCallback((): void => {
    controllerRef.current?.abort()
  }, [])
  useEffect(() => cancel, [cancel])
  const run = useCallback(
    (operation: (signal: AbortSignal) => Promise<unknown>): void => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      operation(controller.signal).catch((error) => {
        if (
          controller.signal.aborted ||
          (error as { name?: string })?.name === 'AbortError'
        ) {
          return
        }
        throw error
      })
    },
    [],
  )
  return [run, cancel]
}
