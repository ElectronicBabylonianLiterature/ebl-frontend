/* global Raven */

import React, { Component, Fragment } from 'react'
import { Alert, Button } from 'react-bootstrap'

class ErrorBoundary extends Component {
  state = {
    error: null,
    info: null
  }

  get hasRaven () {
    return typeof Raven !== 'undefined'
  }

  componentDidCatch (error, info) {
    this.setState({error: error, info: info})
    if (this.hasRaven) {
      Raven.captureException(error, { extra: info })
    }
  }

  render () {
    return this.state.error
      ? (
        <Alert bsStyle='danger'>
          <h4>Something's gone wrong.</h4>
          {this.hasRaven && <Fragment>
            <p>Our team has been notified, but you can fill out a report by clicking the button below.</p>
            <p>
              <Button bsStyle='danger' onClick={() => Raven.lastEventId() && Raven.showReportDialog()}>
                Send a report
              </Button>
            </p>
          </Fragment>}
        </Alert>
      )
      : this.props.children
  }
}

export default ErrorBoundary
