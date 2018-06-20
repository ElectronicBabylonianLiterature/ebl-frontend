import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

class User extends Component {
  logout = () => {
    this.props.auth.logout()
    this.props.history.replace('/')
  }

  login = () => {
    this.props.auth.login()
  }

  render () {
    return (
      this.props.auth.isAuthenticated()
        ? <Button bsSize='xsmall' onClick={this.logout}>Logout</Button>
        : <Button bsSize='xsmall' onClick={this.login}>Login</Button>
    )
  }
}

export default withRouter(User)
