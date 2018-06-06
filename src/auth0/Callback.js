import React, { Component } from 'react'
import { Loading } from 'element-react'

class Callback extends Component {
  handleAuthentication (nextState, replace) {
    if (/access_token|id_token|error/.test(nextState.location.hash)) {
      this.props.auth.handleAuthentication()
        .then(() => nextState.history.replace('/'))
        .catch(() => nextState.history.replace('/'))
    }
  }

  render () {
    this.handleAuthentication(this.props)
    return <Loading fullscreen />
  }
}

export default Callback
