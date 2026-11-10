import { useEffect, useRef, useState } from 'react'
import { isDefinitiveRejection, isStaleRevision } from 'http/ApiError'

export const STALE_MEDIA_MESSAGE =
  'This image was changed by someone else since you opened it. The gallery has been refreshed — please review it again.'

interface OperationFailure {
  readonly error: Error
  readonly followUp?: () => void
}

/**
 * Decides what a failed mutation shows the user and which refresh it needs: a
 * stale revision (412/428) gets an explanatory message and `onStale`; any other
 * failure that does not prove the server rejected it (anything but HTTP 4xx)
 * keeps its own message and triggers `onUncertain`.
 */
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

/** An abort controller that is aborted when the component unmounts. */
function useUnmountController() {
  const controller = useRef(new AbortController())
  useEffect(() => {
    const current = new AbortController()
    controller.current = current
    return () => current.abort()
  }, [])
  return controller
}

/**
 * Runs one media mutation. `onUncertain` fires when the mutation failed in a
 * way that does not prove the server rejected it (anything but HTTP 4xx), so
 * the caller can refresh while the error is still surfaced to the user.
 * `onStale` fires instead when the server refused the item's revision (412/428):
 * the user acted on an outdated view, so the caller must refresh and let them
 * review the current item before acting again.
 */
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
