import * as Sentry from '@sentry/browser'

class SentryErrorReporter {
  static init () {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN
    })
  }

  captureException (error, errorInfo = {}) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  showReportDialog () {
    Sentry.showReportDialog()
  }
}

export default SentryErrorReporter
