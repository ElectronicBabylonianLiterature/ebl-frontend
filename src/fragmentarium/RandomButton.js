import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import Promise from 'bluebird'
import ErrorAlert from 'ErrorAlert'
import Spinner from 'Spinner'
import { withRouter } from 'react-router-dom'

class RandomButton extends Component {
  constructor (props) {
    super(props)
    this.fetchPromise = Promise.resolve()
  }

  state = {
    error: null,
    loading: false
  }

  click = event => {
    this.fetchPromise.cancel()
    this.setState({ error: null, loading: true })
    this.fetchPromise = this.props.apiClient
      .fetchJson(`/fragments?${this.props.param}=true`, true)
      .then(fragments => this.props.history.push(`/fragmentarium/${fragments[0]._id}`))
      .catch(error => this.setState({ error: error, loading: false }))
  }

  componentWillUnmount = () => this.fetchPromise.cancel()

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
