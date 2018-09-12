/* global AbortController */
import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import ErrorAlert from 'ErrorAlert'
import Spinner from 'Spinner'
import { withRouter } from 'react-router-dom'

class RandomButton extends Component {
  abortController = new AbortController()

  state = {
    error: null,
    loading: false
  }

  click = event => {
    this.setState({ error: null, loading: true })
    this.props.apiClient
      .fetchJson(`/fragments?${this.props.param}=true`, true, this.abortController.signal)
      .then(fragments => this.props.history.push(`/fragmentarium/${fragments[0]._id}`))
      .catch(error => {
        if (this.props.apiClient.isNotAbortError(error)) {
          this.setState({ error: error, loading: false })
        }
      })
  }

  componentWillUnmount = () => this.abortController.abort()

  render () {
    return (
      <Fragment>
        <Button bsStyle='primary' onClick={this.click}>
          {this.state.loading
            ? <Spinner />
            : this.props.children
          }
        </Button>
        <ErrorAlert error={this.state.error} />
      </Fragment>
    )
  }
}

export default withRouter(RandomButton)
