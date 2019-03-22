import React from 'react'

const ErrorReporterContext = React.createContext({
  captureException (error, errorInfo = {}) {
    console.error(error, errorInfo)
  },
  showReportDialog () { },
  setUser () { },
  clearScope () { }
})

export default ErrorReporterContext
