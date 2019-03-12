import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import ErrorAlert from 'common/ErrorAlert'
import Spinner from 'common/Spinner'
import { createFragmentUrl } from 'fragmentarium/FragmentLink'

class RandomButton extends Component {
  fetchPromise = Promise.resolve()
  state = {
    error: null,
    loading: false
  }

  click = event => {
    this.fetchPromise.cancel()
    this.setState({ error: null, loading: true })
    this.fetchPromise = this.props.fragmentService[this.props.method]()
      .then(fragment => this.props.history.push(createFragmentUrl(fragment.number)))
      .catch(error => this.setState({ error: error, loading: false }))
  }

  componentWillUnmount = () => this.fetchPromise.cancel()

  render () {
    return (
      <Fragment>
        <Button variant='primary' onClick={this.click}>
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
