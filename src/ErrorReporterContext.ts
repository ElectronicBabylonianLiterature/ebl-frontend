import React from 'react'

export interface ErrorReporter {
  captureException(error: Error, errorInfo?: object): void
  showReportDialog(): void
  setUser(id: string, username: string, eblName: string): void
  clearScope(): void
}

export const defaultErrorReporter = {
  captureException(error: Error, errorInfo = {}) {
    console.error('captureException', error, errorInfo)
  },
  showReportDialog(error: Error, errorInfo: {}) {
    console.error('showReportDialog', error, errorInfo)
  },
  setUser(id: string, username: string, eblName: string) {
    console.error('setUser', id, username, eblName)
  },
  clearScope() {
    console.error('clearScope')
  }
}

export default React.createContext(defaultErrorReporter)
