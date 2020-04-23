import React, { Component, ReactNode } from 'react'
import { Alert, Button } from 'react-bootstrap'
import ErrorReporterContext from 'ErrorReporterContext'

class ErrorBoundary extends Component {
  state = {
    error: null,
  }

  static contextType = ErrorReporterContext

  componentDidCatch(error, info): void {
    this.setState({ error: error })
    this.context.captureException(error, info)
  }

  render(): ReactNode {
    return this.state.error ? (
      <Alert variant="danger">
        <h4>Something&apos;s gone wrong.</h4>
        <p>
          Our team has been notified, but you can fill out a report by clicking
          the button below.
        </p>
        <p>
          <Button
            variant="danger"
            onClick={() => this.context.showReportDialog()}
          >
            Send a report
          </Button>
        </p>
      </Alert>
    ) : (
      this.props.children
    )
  }
}

export default ErrorBoundary
