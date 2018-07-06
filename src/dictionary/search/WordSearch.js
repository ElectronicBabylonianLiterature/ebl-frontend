import React, { Component, Fragment } from 'react'
import _ from 'lodash'

import Spinner from 'Spinner'
import Word from './Word'
import Error from 'Error'

import './WordSearch.css'

class WordSearch extends Component {
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
        .fetchJson(`/words?query=${encodeURIComponent(this.props.query)}`)
        .then(words => this.setState({words: words, error: null}))
        .catch(error => this.setState({words: [], error: error}))
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

  render () {
    return this.isLoading
      ? <Spinner />
      : (
        <Fragment>
          <ul className='WordSearch-results'>
            {this.state.words.map(word =>
              <li key={word._id}>
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
