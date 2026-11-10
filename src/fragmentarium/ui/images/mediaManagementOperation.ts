import { useEffect, useRef, useState } from 'react'
import { isDefinitiveRejection, isStaleRevision } from 'http/ApiError'

export const STALE_MEDIA_MESSAGE =
  'This image was changed by someone else since you opened it. The gallery has been refreshed — please review it again.'

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
  const controller = useRef(new AbortController())
  useEffect(() => {
    const current = new AbortController()
    controller.current = current
    return () => current.abort()
  }, [])
  const run = async (
    operation: (signal: AbortSignal) => Promise<unknown>,
  ): Promise<void> => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await operation(controller.current.signal)
      if (!controller.current.signal.aborted) onSuccess()
    } catch (error) {
      if (controller.current.signal.aborted) return
      if (isStaleRevision(error)) {
        setError(new Error(STALE_MEDIA_MESSAGE))
        onStale()
      } else {
        setError(error as Error)
        if (!isDefinitiveRejection(error)) onUncertain()
      }
    } finally {
      if (!controller.current.signal.aborted) setSaving(false)
    }
  }
  return { saving, error, clearError: () => setError(null), run }
}
