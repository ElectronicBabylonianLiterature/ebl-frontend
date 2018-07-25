import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import Error from 'Error'
import { withRouter } from 'react-router-dom'

class LuckyButton extends Component {
  state = {
    error: null
  }

  click = event => {
    this.props.apiClient
      .fetchJson(`/fragments?random=true`, true)
      .then(fragments => this.props.history.push(`/fragmentarium/${fragments[0]._id}`))
      .catch(error => this.setState({error: error}))
  }

  render () {
    return (
      <Fragment>
        <Button bsStyle='primary' onClick={this.click}>I'm feeling lucky</Button>
        <Error error={this.state.error} />
      </Fragment>
    )
  }
}

export default withRouter(LuckyButton)
