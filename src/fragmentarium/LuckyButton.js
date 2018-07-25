import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import Error from 'Error'
import Spinner from 'Spinner'
import { withRouter } from 'react-router-dom'

class LuckyButton extends Component {
  state = {
    error: null,
    loading: false
  }

  click = event => {
    this.setState({error: null, loading: true})
    this.props.apiClient
      .fetchJson(`/fragments?random=true`, true)
      .then(fragments => this.props.history.push(`/fragmentarium/${fragments[0]._id}`))
      .catch(error => this.setState({error: error, loading: false}))
  }

  render () {
    return (
      <Fragment>
        <Button bsStyle='primary' onClick={this.click}>
          {this.state.loading
            ? <Spinner />
            : 'I\'m feeling lucky'
          }
        </Button>
        <Error error={this.state.error} />
      </Fragment>
    )
  }
}

export default withRouter(LuckyButton)
