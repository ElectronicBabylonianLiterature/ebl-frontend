export function isAbortError(error: unknown): boolean {
  return (error as { name?: string })?.name === 'AbortError'
}

export function isCancellation(error: unknown, signal?: AbortSignal): boolean {
  return isAbortError(error) || Boolean(signal?.aborted)
}

export function createAbortError(signal: AbortSignal): Error {
  return (
    (signal.reason as Error | undefined) ??
    new DOMException('The operation was aborted.', 'AbortError')
  )
}
