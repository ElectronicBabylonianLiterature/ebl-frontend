import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { AuthenticationService } from './Auth'

class User extends Component<{ auth: AuthenticationService }> {
  logout = () => {
    this.props.auth.logout()
  }

  login = () => {
    this.props.auth.login()
  }

  render() {
    return this.props.auth.isAuthenticated() ? (
      <Button size="sm" variant="outline-secondary" onClick={this.logout}>
        Logout
      </Button>
    ) : (
      <Button size="sm" variant="outline-secondary" onClick={this.login}>
        Login
      </Button>
    )
  }
}

export default User
