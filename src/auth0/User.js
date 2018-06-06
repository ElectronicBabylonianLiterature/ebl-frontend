import React, { Component } from 'react'
import { Button } from 'element-react'
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
        ? <Button type='text' onClick={this.logout}>Logout</Button>
        : <Button type='text' onClick={this.login}>Login</Button>
    )
  }
}

export default withRouter(User)
