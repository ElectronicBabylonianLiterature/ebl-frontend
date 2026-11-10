import SentryErrorReporter from 'common/errors/SentryErrorReporter'

export default function reportFallbackError(error: Error): void {
  const reporter = new SentryErrorReporter()
  reporter.captureException(error)
}
