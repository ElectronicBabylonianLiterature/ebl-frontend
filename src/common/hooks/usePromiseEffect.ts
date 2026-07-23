import { useRef, useEffect, useCallback, MutableRefObject } from 'react'

export type PromiseOperation = (signal: AbortSignal) => Promise<unknown>

type ControllerRef = MutableRefObject<AbortController | null>

function startOperation(
  controllerRef: ControllerRef,
  operation: PromiseOperation,
): void {
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
}

export default function usePromiseEffect(): [
  (operation: PromiseOperation) => void,
  () => void,
  (operation: PromiseOperation) => void,
] {
  const controllerRef = useRef<AbortController | null>(null)
  const writeControllerRef = useRef<AbortController | null>(null)
  const cancel = useCallback((): void => {
    controllerRef.current?.abort()
  }, [])
  useEffect(() => cancel, [cancel])
  const run = useCallback(
    (operation: PromiseOperation): void =>
      startOperation(controllerRef, operation),
    [],
  )
  const runWrite = useCallback(
    (operation: PromiseOperation): void =>
      startOperation(writeControllerRef, operation),
    [],
  )
  return [run, cancel, runWrite]
}
