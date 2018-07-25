import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

class LuckyButton extends Component {
  click = event => {
    this.props.apiClient
      .fetchJson(`/fragments?random=true`, true)
      .then(fragments => this.props.history.push(`/fragmentarium/${fragments[0]._id}`))
  }

  render () {
    return (
      <Button bsStyle='primary' onClick={this.click}>I'm feeling lucky</Button>
    )
  }
}

export default withRouter(LuckyButton)
