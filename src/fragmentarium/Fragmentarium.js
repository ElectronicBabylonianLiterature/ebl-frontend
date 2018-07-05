import React, { Component } from 'react'
import { Breadcrumb } from 'react-bootstrap'

import Error from '../Error'
import Spinner from '../Spinner'
import CuneiformFragment from './CuneiformFragment'

class Fragmentarium extends Component {
  state = {
    fragment: null,
    error: null
  }

  get fragmentUrl () {
    return `/fragments/${this.props.match.params.id}`
  }

  get isLoading () {
    return !this.state.fragment && !this.state.error
  }

  componentDidMount () {
    this.props.apiClient
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
            {!this.state.fragment && <h2>{this.props.match.params.id}</h2>}
          </header>
          {this.state.fragment && <CuneiformFragment fragment={this.state.fragment} />}
          <Error error={this.state.error} />
        </section>
      )
  }
}

export default Fragmentarium
