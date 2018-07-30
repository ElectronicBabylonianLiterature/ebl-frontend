import React, { Component } from 'react'
import ErrorAlert from 'ErrorAlert'

class ErrorBoundary extends Component {
  state = {
    error: null,
    info: null
  }

  componentDidCatch (error, info) {
    this.setState({error: error, info: info})
  }

  render () {
    return this.state.error
      ? <ErrorAlert error={this.state.error} />
      : this.props.children
  }
}

export default ErrorBoundary
