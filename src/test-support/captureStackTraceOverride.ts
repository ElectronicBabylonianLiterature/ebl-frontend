const captureStackTraceProperty = 'captureStackTrace'

export type CaptureStackTraceOverride = {
  replace: (capture: unknown) => void
  remove: () => void
  restore: () => void
}

export function overrideCaptureStackTrace(): CaptureStackTraceOverride {
  const original: unknown = Reflect.get(Error, captureStackTraceProperty)
  return {
    replace: (capture: unknown): void => {
      Reflect.set(Error, captureStackTraceProperty, capture)
    },
    remove: (): void => {
      Reflect.deleteProperty(Error, captureStackTraceProperty)
    },
    restore: (): void => {
      Reflect.set(Error, captureStackTraceProperty, original)
    },
  }
}
