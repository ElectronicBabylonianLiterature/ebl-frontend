import * as Sentry from '@sentry/react'
import { ErrorReporter } from 'ErrorReporterContext'

function isIgnored(error: string | Error | null | undefined): boolean {
  if (error) {
    return ['ApiError', 'AbortError'].includes(error['name'])
  } else {
    return false
  }
}

class SentryErrorReporter implements ErrorReporter {
  static init(dsn: string, environment: string): void {
    Sentry.init({
      dsn,
      environment,
      beforeSend(event, hint) {
        const original = hint?.originalException as Error | string | null
        return original && isIgnored(original) ? null : event
      },
    })
  }

  captureException(error: Error, errorInfo = {}): void {
    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  showReportDialog(): void {
    Sentry.showReportDialog()
  }

  setUser(id: string, username: string, eblName: string): void {
    Sentry.configureScope((scope) => {
      scope.setUser({ id, username, eblName })
    })
  }

  clearScope(): void {
    Sentry.configureScope((scope) => {
      scope.clear()
    })
  }
}

export default SentryErrorReporter
