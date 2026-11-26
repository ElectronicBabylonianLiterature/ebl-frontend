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

export function rejectOnAbort<Value>(
  promise: Promise<Value>,
  signal?: AbortSignal,
): Promise<Value> {
  if (!signal) {
    return promise
  }
  return new Promise<Value>((resolve, reject) => {
    const abort = (): void => reject(createAbortError(signal))
    if (signal.aborted) {
      abort()
    }
    signal.addEventListener('abort', abort, { once: true })
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener('abort', abort))
  })
}
