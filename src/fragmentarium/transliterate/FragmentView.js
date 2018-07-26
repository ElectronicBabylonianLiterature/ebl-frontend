/* global AbortController */
import React, { Component, Fragment } from 'react'

import Breadcrumbs from 'Breadcrumbs'
import Error from 'Error'
import Spinner from 'Spinner'
import CuneiformFragment from './CuneiformFragment'
import FragmentPager from './FragmentPager'

class FragmentView extends Component {
  abortController = new AbortController()

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

  componentWillUnmount () {
    this.abortController.abort()
  }

  fetchFragment = () => {
    this.setState({fragment: null, error: null})
    this.props.apiClient
      .fetchJson(this.fragmentUrl, true, this.abortController.signal)
      .then(json => this.setState({fragment: json, error: null}))
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({fragment: null, error: error})
        }
      })
  }

  header = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' active={this.props.match.params.id} />
        <h2><FragmentPager number={this.props.match.params.id}> {this.props.match.params.id} </FragmentPager></h2>
      </header>
    )
  }

  render () {
    return (
      <section className='App-content App-content--wide'>
        <this.header />
        {this.props.auth.isAuthenticated()
          ? (
            <Fragment>
              {this.isLoading && <section><Spinner /></section>}
              {this.state.fragment && <CuneiformFragment
                fragment={this.state.fragment}
                apiClient={this.props.apiClient}
                onChange={this.fetchFragment}
              />}
              <Error error={this.state.error} />
            </Fragment>
          ) : 'You need to be logged in to access the fragmentarium.'
        }
      </section>
    )
  }
}

export default FragmentView
