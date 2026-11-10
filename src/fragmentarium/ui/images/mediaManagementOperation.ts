import { useEffect, useRef, useState } from 'react'
import { isDefinitiveRejection } from 'http/ApiError'

/**
 * Runs one media mutation. `onUncertain` fires when the mutation failed in a
 * way that does not prove the server rejected it (anything but HTTP 4xx), so
 * the caller can refresh while the error is still surfaced to the user.
 */
export function useMediaOperation(
  onSuccess: () => void,
  onUncertain: () => void = () => undefined,
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
      if (!controller.current.signal.aborted) {
        setError(error as Error)
        if (!isDefinitiveRejection(error)) onUncertain()
      }
    } finally {
      if (!controller.current.signal.aborted) setSaving(false)
    }
  }
  return { saving, error, clearError: () => setError(null), run }
}
