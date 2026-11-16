import { useEffect, useRef, useState } from 'react'
import { isDefinitiveRejection, isStaleRevision } from 'http/ApiError'

export const STALE_MEDIA_MESSAGE =
  'This image was changed by someone else since you opened it. The gallery has been refreshed — please review it again.'

interface OperationFailure {
  readonly error: Error
  readonly followUp?: () => void
}

function classifyFailure(
  error: unknown,
  onUncertain: () => void,
  onStale: () => void,
): OperationFailure {
  if (isStaleRevision(error))
    return { error: new Error(STALE_MEDIA_MESSAGE), followUp: onStale }
  return {
    error: error as Error,
    followUp: isDefinitiveRejection(error) ? undefined : onUncertain,
  }
}

function useUnmountController() {
  const controller = useRef(new AbortController())
  useEffect(() => {
    const current = new AbortController()
    controller.current = current
    return () => current.abort()
  }, [])
  return controller
}

export function useMediaOperation(
  onSuccess: () => void,
  onUncertain: () => void = () => undefined,
  onStale: () => void = onUncertain,
) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const controller = useUnmountController()
  const isAborted = (): boolean => controller.current.signal.aborted
  const fail = (error: unknown): void => {
    const failure = classifyFailure(error, onUncertain, onStale)
    setError(failure.error)
    failure.followUp?.()
  }
  const run = async (
    operation: (signal: AbortSignal) => Promise<unknown>,
  ): Promise<void> => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await operation(controller.current.signal)
      if (!isAborted()) onSuccess()
    } catch (error) {
      if (!isAborted()) fail(error)
    } finally {
      if (!isAborted()) setSaving(false)
    }
  }
  return { saving, error, clearError: () => setError(null), run }
}
