import React from 'react'

export const deafaultErrorReporter = {
  captureException (error, errorInfo = {}) {
    console.error(error, errorInfo)
  },
  showReportDialog () { },
  setUser () { },
  clearScope () { }
}

const ErrorReporterContext = React.createContext(deafaultErrorReporter)

export default ErrorReporterContext
