/* global AbortController */
import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import ErrorAlert from 'ErrorAlert'
import Spinner from 'Spinner'
import { withRouter } from 'react-router-dom'

class LuckyButton extends Component {
  abortController = new AbortController()

  state = {
    error: null,
    loading: false
  }

  click = event => {
    this.setState({error: null, loading: true})
    this.props.apiClient
      .fetchJson(`/fragments?random=true`, true, this.abortController.signal)
      .then(fragments => this.props.history.push(`/fragmentarium/${fragments[0]._id}`))
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({error: error, loading: false})
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
            : 'I\'m feeling lucky'
          }
        </Button>
        <ErrorAlert error={this.state.error} />
      </Fragment>
    )
  }
}

export default withRouter(LuckyButton)
