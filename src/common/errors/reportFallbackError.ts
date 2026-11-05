import SentryErrorReporter from 'common/errors/SentryErrorReporter'
import { ApiError } from 'http/ApiClient'

export default function reportFallbackError(error: Error): void {
  const reporter = new SentryErrorReporter()
  if (error instanceof ApiError) {
    // Recovered HTTP failures must survive Sentry's general ApiError filter.
    reporter.captureException(new Error(error.message, { cause: error }), {
      status: error.status,
    })
    return
  }
  reporter.captureException(error)
}
