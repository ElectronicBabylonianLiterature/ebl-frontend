import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

class User extends Component {
  logout = () => {
    this.props.auth.logout()
  }

  login = () => {
    this.props.auth.login()
  }

  render () {
    return (
      this.props.auth.isAuthenticated()
        ? <Button size='sm' variant='outline-secondary' onClick={this.logout}>Logout</Button>
        : <Button size='sm' variant='outline-secondary' onClick={this.login}>Login</Button>
    )
  }
}

export default User
