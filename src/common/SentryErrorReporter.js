import * as Sentry from '@sentry/browser'

class SentryErrorReporter {
  static init(dsn, environment) {
    Sentry.init({
      dsn,
      environment
    })
  }

  captureException(error, errorInfo = {}) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  showReportDialog() {
    Sentry.showReportDialog()
  }

  setUser(id, username, eblName) {
    Sentry.configureScope(scope => {
      scope.setUser({ id, username, eblName })
    })
  }

  clearScope() {
    Sentry.configureScope(scope => {
      scope.clear()
    })
  }
}

export default SentryErrorReporter
