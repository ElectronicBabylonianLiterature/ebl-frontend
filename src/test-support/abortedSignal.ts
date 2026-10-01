export function abortedSignalWithReason(reason: unknown): AbortSignal {
  const controller = new AbortController()
  controller.abort()
  Object.defineProperty(controller.signal, 'reason', { value: reason })
  return controller.signal
}
