import React from 'react'

export interface ErrorReporter {
  captureException(error: Error, errorInfo?: object): void
  showReportDialog(): void
  setUser(id: string, username: string, eblName: string): void
  clearScope(): void
}

export class ConsoleErrorReporter implements ErrorReporter {
  captureException(error: Error, errorInfo = {}): void {
    console.error('captureException', error, errorInfo)
  }

  showReportDialog(): void {
    console.error('showReportDialog')
  }

  setUser(id: string, username: string, eblName: string): void {
    console.error('setUser', id, username, eblName)
  }

  clearScope(): void {
    console.error('clearScope')
  }
}

export default React.createContext(new ConsoleErrorReporter())
