import React, { Component } from 'react'
import { Alert } from 'react-bootstrap'
import Spinner from '../../Spinner'
import _ from 'lodash'

import Word from './Word'

class WordSearch extends Component {
  state = {
    words: null,
    error: null
  }

  fetchWords () {
    if (_.isEmpty(this.props.query)) {
      this.setState({words: [], error: null})
    } else {
      this.setState({words: null, error: null})
      this.props.httpClient
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
    if (_.isObject(this.state.error)) {
      return <Alert bsStyle='danger'>{this.state.error.message}</Alert>
    } else if (_.isArray(this.state.words)) {
      return (
        <ul className='Dictionary-results'>
          {this.state.words.map(word =>
            <li key={word._id}>
              <Word value={word} />
            </li>
          )}
        </ul>
      )
    } else {
      return <Spinner />
    }
  }
}

export default WordSearch
