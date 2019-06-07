import React from 'react'

export const defaultErrorReporter = {
  captureException(error, errorInfo = {}) {
    console.error(error, errorInfo)
  },
  showReportDialog() {},
  setUser() {},
  clearScope() {}
}

export default React.createContext(defaultErrorReporter)
