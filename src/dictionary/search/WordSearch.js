import React, { Component } from 'react'
import { Alert } from 'react-bootstrap'
import _ from 'lodash'

import Word from './Word'

class WordSearch extends Component {
  state = {
    words: [],
    error: null
  }

  fetchWords () {
    if (_.isEmpty(this.props.lemma)) {
      this.setState({words: [], error: null})
    } else {
      this.props.httpClient
        .fetchJson(`${process.env.REACT_APP_DICTIONARY_API_URL}/words/search/${this.props.lemma}`)
        .then(words => this.setState({words: words, error: null}))
        .catch(error => this.setState({words: [], error: error}))
    }
  }

  componentDidMount () {
    this.fetchWords()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.lemma !== this.props.lemma) {
      this.fetchWords()
    }
  }

  render () {
    return (
      this.state.error ? (
        <Alert bsStyle='danger'>
          {this.state.error.message}
        </Alert>
      ) : (
        <ul className='Dictionary-results'>
          {this.state.words.map(word =>
            <li key={word._id}>
              <Word value={word} />
            </li>
          )}
        </ul>
      )
    )
  }
}

export default WordSearch
