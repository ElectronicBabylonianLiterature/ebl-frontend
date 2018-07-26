/* global AbortController */
import React, { Component, Fragment } from 'react'
import _ from 'lodash'

import Spinner from 'Spinner'
import Word from './Word'
import Error from 'Error'

import './WordSearch.css'

class WordSearch extends Component {
  abortController = new AbortController()

  state = {
    words: null,
    error: null
  }

  get isLoading () {
    return _.isNil(this.state.error) && _.isNil(this.state.words)
  }

  fetchWords () {
    if (_.isEmpty(this.props.query)) {
      this.setState({words: [], error: null})
    } else {
      this.setState({words: null, error: null})
      this.props.apiClient
        .fetchJson(`/words?query=${encodeURIComponent(this.props.query)}`, true, this.abortController.signal)
        .then(words => this.setState({words: words, error: null}))
        .catch(error => {
          if (error.name !== 'AbortError') {
            this.setState({words: [], error: error})
          }
        })
    }
  }

  componentDidMount () {
    this.fetchWords()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.query !== this.props.query) {
      this.fetchWords()
    }
  }

  componentWillUnmount () {
    this.abortController.abort()
  }

  render () {
    return this.isLoading
      ? <Spinner />
      : (
        <Fragment>
          <ul className='WordSearch-results'>
            {this.state.words.map(word =>
              <li key={word._id} className='WordSearch-results__result'>
                <Word value={word} />
              </li>
            )}
          </ul>
          <Error error={this.state.error} />
        </Fragment>
      )
  }
}

export default WordSearch
