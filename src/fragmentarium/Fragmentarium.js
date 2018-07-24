import React, { Component } from 'react'
import queryString from 'query-string'
import Breadcrumbs from 'Breadcrumbs'
import Error from 'Error'
import Spinner from 'Spinner'
import FragmentSearch from 'fragmentarium/search/FragmentSearch'

import './Fragmentarium.css'

class Fragmentarium extends Component {
  state = {
    statistics: null,
    error: null
  }

  get isLoading () {
    return !this.state.statistics && !this.state.error
  }

  componentDidMount () {
    this.fetchStatistics()
  }

  fetchStatistics = () => {
    this.setState({statistics: null, error: null})
    this.props.apiClient
      .fetchJson('/statistics', false)
      .then(json => this.setState({statistics: json, error: null}))
      .catch(error => this.setState({statistics: null, error: error}))
  }

  header = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' />
        <h2>Fragmentarium</h2>
      </header>
    )
  }

  render () {
    const number = queryString.parse(this.props.location.search).number || 'K.1'
    return (
      <section className='App-content'>
        <this.header />
        <section>
          {this.props.auth.isAuthenticated()
            ? <FragmentSearch number={number} apiClient={this.props.apiClient} />
            : <p>You need to be logged in to access the fragments.</p>
          }
        </section>
        <section className='Fragmentarium__statistics'>
          <header>Current size of the corpus:</header>
          {this.isLoading && <section><Spinner /></section>}
          {this.state.statistics && <p className='Fragmentarium__statistics-values'>
            {this.state.statistics.transliteratedFragments.toLocaleString()} tablets transliterated<br />
            {this.state.statistics.lines.toLocaleString()} lines of text
          </p>}
          <Error error={this.state.error} />
        </section>
      </section>
    )
  }
}

export default Fragmentarium
