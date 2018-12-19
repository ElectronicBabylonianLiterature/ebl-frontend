/* global Raven */

class RavenErrorReporter {
  captureException (error, info) {
    Raven.captureException(error, { extra: info })
  }

  showReportDialog () {
    Raven.lastEventId() && Raven.showReportDialog()
  }
}

export default RavenErrorReporter
