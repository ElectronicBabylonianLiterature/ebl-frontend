/* global Raven */
import React, { Component } from 'react'
import { Alert, Button } from 'react-bootstrap'

class ErrorBoundary extends Component {
  state = {
    error: null,
    info: null
  }

  componentDidCatch (error, info) {
    this.setState({error: error, info: info})
    Raven.captureException(error, { extra: info })
  }

  render () {
    return this.state.error
      ? (
        <Alert bsStyle='danger'>
          <h4>Something's gone wrong.</h4>
          <p>Our team has been notified, but you can fill out a report by clicking the button below.</p>
          <p>
            <Button bsStyle='danger' onClick={() => Raven.lastEventId() && Raven.showReportDialog()}>
              Send a report
            </Button>
          </p>
        </Alert>
      )
      : this.props.children
  }
}

export default ErrorBoundary
