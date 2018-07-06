import React, { Component, Fragment } from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

import Error from '../Error'
import Spinner from '../Spinner'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'

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
    this.fetchFragment()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchFragment()
    }
  }

  fetchFragment () {
    this.setState({fragment: null, error: null})
    this.props.apiClient
      .fetchJson(this.fragmentUrl)
      .then(json => this.setState({fragment: json, error: null}))
      .catch(error => this.setState({fragment: null, error: error}))
  }

  header = () => {
    return (
      <header>
        <Breadcrumb separator='/'>
          <LinkContainer to='/'>
            <Breadcrumb.Item>eBL</Breadcrumb.Item>
          </LinkContainer>
          <LinkContainer to='/fragmentarium/K.1'>
            <Breadcrumb.Item>Fragmentarium</Breadcrumb.Item>
          </LinkContainer>
          <Breadcrumb.Item active>{this.props.match.params.id}</Breadcrumb.Item>
        </Breadcrumb>
        {!this.state.fragment && <h2>{this.props.match.params.id}</h2>}
      </header>
    )
  }

  render () {
    return (
      <section>
        <this.header />
        {this.props.auth.isAuthenticated()
          ? (
            <Fragment>
              {this.isLoading && <section><Spinner /></section>}
              {this.state.fragment && <CuneiformFragment fragment={this.state.fragment} />}
              <Error error={this.state.error} />
              <FragmentPager number={this.props.match.params.id} />
            </Fragment>
          ) : 'You need to be logged in to access the fragmentarium.'
        }
      </section>
    )
  }
}

export default Fragmentarium
