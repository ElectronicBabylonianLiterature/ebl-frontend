import { useRef, useEffect, useCallback } from 'react'
import AbortableOperation from 'common/utils/AbortableOperation'
import SupersedableOperation, {
  StalenessCheck,
} from 'common/utils/SupersedableOperation'
import { isCancellation } from 'common/utils/abortError'

export type PromiseOperation = (signal: AbortSignal) => Promise<unknown>
export type WriteOperation = (isStale: StalenessCheck) => Promise<unknown>
export type RunOperation = (operation: PromiseOperation) => Promise<void>
export type RunWriteOperation = (operation: WriteOperation) => Promise<void>

export default function usePromiseEffect(): [
  RunOperation,
  () => void,
  RunWriteOperation,
] {
  const readOperation = useRef(new AbortableOperation())
  const writeOperation = useRef(new SupersedableOperation())
  const cancel = useCallback((): void => readOperation.current.abort(), [])
  useEffect(() => cancel, [cancel])
  const run = useCallback((operation: PromiseOperation): Promise<void> => {
    const signal = readOperation.current.start()
    return operation(signal).then(
      () => undefined,
      (error) => {
        if (!isCancellation(error, signal)) {
          throw error
        }
      },
    )
  }, [])
  const runWrite = useCallback(
    (operation: WriteOperation): Promise<void> =>
      operation(writeOperation.current.start()).then(() => undefined),
    [],
  )
  return [run, cancel, runWrite]
}
