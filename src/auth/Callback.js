
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Spinner from 'common/Spinner'
import ErrorReporterContext from 'ErrorReporterContext'

const redirectTarget = '/'

class Callback extends Component {
  constructor (props) {
    super(props)
    this.location = props.location
    this.history = props.history
    this.auth = props.auth
  }

  static contextType = ErrorReporterContext

  render () {
    if (/access_token|id_token|error/.test(this.location.hash)) {
      this.auth.handleAuthentication()
        .then(() => this.history.replace(redirectTarget))
        .catch(error => {
          this.context.captureException(error)
          this.history.replace(redirectTarget)
        })
      return <Spinner />
    } else {
      return <Redirect to={redirectTarget} />
    }
  }
}

export default Callback
