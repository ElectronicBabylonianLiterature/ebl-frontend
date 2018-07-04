import React, { Component } from 'react'
import { Alert, Breadcrumb } from 'react-bootstrap'

import Spinner from '../Spinner'

class Fragment extends Component {
  state = {
    fragment: null,
    error: null
  }

  get fragmentUrl () {
    return `${process.env.REACT_APP_DICTIONARY_API_URL}/fragments/${this.props.match.params.id}`
  }

  get isLoading () {
    return !this.state.fragment && !this.state.error
  }

  componentDidMount () {
    this.props.httpClient
      .fetchJson(this.fragmentUrl)
      .then(json => this.setState({fragment: json, error: null}))
      .catch(error => this.setState({fragment: null, error: error}))
  }

  render () {
    return this.isLoading
      ? <section><Spinner /></section>
      : (
        <section className='Fragment'>
          <header>
            <Breadcrumb separator='/'>
              <Breadcrumb.Item href='/'>eBL</Breadcrumb.Item>
              <Breadcrumb.Item>Fragmentarium</Breadcrumb.Item>
              <Breadcrumb.Item active>{this.props.match.params.id}</Breadcrumb.Item>
            </Breadcrumb>
            <h2>{this.props.match.params.id}</h2>
          </header>
          {this.state.fragment && JSON.stringify(this.state.fragment, null, 2)}
          {this.state.error && <Alert bsStyle='danger'>{this.state.error.message}</Alert>}
        </section>
      )
  }
}

export default Fragment
