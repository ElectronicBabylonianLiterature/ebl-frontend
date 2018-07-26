/* global AbortController */
import React, { Component } from 'react'
import _ from 'lodash'
import Error from 'Error'
import Spinner from 'Spinner'

import './Statistics.css'

class Statistics extends Component {
  abortController = new AbortController()

  state = {
    statistics: null,
    error: null
  }

  get isLoading () {
    return !this.state.statistics && !this.state.error
  }

  get localizedStatistics () {
    return _.mapValues(this.state.statistics, value => value.toLocaleString())
  }

  componentDidMount () {
    this.fetchStatistics()
  }

  componentWillUnmount () {
    this.abortController.abort()
  }

  fetchStatistics = () => {
    this.setState({statistics: null, error: null})
    this.props.apiClient
      .fetchJson('/statistics', false, this.abortController.signal)
      .then(json => this.setState({statistics: json, error: null}))
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({statistics: null, error: error})
        }
      })
  }

  render () {
    return (
      <section className='Statistics'>
        <header>Current size of the corpus:</header>
        {this.isLoading && <section><Spinner /></section>}
        {this.state.statistics && <p className='Statistics__values'>
          {this.localizedStatistics.transliteratedFragments} tablets transliterated<br />
          {this.localizedStatistics.lines} lines of text
        </p>}
        <Error error={this.state.error} />
      </section>
    )
  }
}

export default Statistics
