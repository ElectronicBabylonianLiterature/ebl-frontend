import { useRef, useEffect, useCallback, MutableRefObject } from 'react'
import AbortableOperation from 'common/utils/AbortableOperation'
import { isCancellation } from 'common/utils/abortError'

export type PromiseOperation = (signal: AbortSignal) => Promise<unknown>
export type RunOperation = (operation: PromiseOperation) => Promise<void>

type OperationRef = MutableRefObject<AbortableOperation>

function startOperation(
  operationRef: OperationRef,
  operation: PromiseOperation,
): Promise<void> {
  const signal = operationRef.current.start()
  return operation(signal).then(
    () => undefined,
    (error) => {
      if (!isCancellation(error, signal)) {
        throw error
      }
    },
  )
}

export default function usePromiseEffect(): [
  RunOperation,
  () => void,
  RunOperation,
] {
  const readOperation = useRef(new AbortableOperation())
  const writeOperation = useRef(new AbortableOperation())
  const cancel = useCallback((): void => readOperation.current.abort(), [])
  useEffect(() => cancel, [cancel])
  const run = useCallback(
    (operation: PromiseOperation): Promise<void> =>
      startOperation(readOperation, operation),
    [],
  )
  const runWrite = useCallback(
    (operation: PromiseOperation): Promise<void> =>
      startOperation(writeOperation, operation),
    [],
  )
  return [run, cancel, runWrite]
}
