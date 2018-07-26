/* global AbortController */
import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'

import Breadcrumbs from 'Breadcrumbs'
import WordForm from './WordForm'
import Spinner from 'Spinner'
import Error from 'Error'

class WordEditor extends Component {
  abortController = new AbortController()

  state = {
    word: null,
    error: null,
    saving: false
  }

  get wordUrl () {
    return `/words/${this.props.match.params.id}`
  }

  get isLoading () {
    return !this.state.word && !this.state.error
  }

  componentDidMount () {
    this.props.apiClient
      .fetchJson(this.wordUrl, true, this.abortController.signal)
      .then(json => this.setState({word: json, error: null, saving: false}))
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({word: null, error: error, saving: false})
        }
      })
  }

  componentWillUnmount () {
    this.abortController.abort()
  }

  updateWord = word => {
    this.setState({word: this.state.word, error: null, saving: true})
    this.props.apiClient
      .postJson(this.wordUrl, word, this.abortController.signal)
      .then(() => this.setState({word: word, error: null, saving: false}))
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.setState({word: this.state.word, error: error, saving: false})
        }
      })
  }

  render () {
    return this.isLoading
      ? <section className='App-content'><Spinner /></section>
      : (
        <section className='App-content'>
          <header>
            <Breadcrumbs section='Dictionary' active={this.props.match.params.id} />
            {this.state.word && <h2>
              Edit <strong>{this.state.word.attested === false && '*'}{this.state.word.lemma.join(' ')}</strong> {this.state.word.homonym}
              {' '}
              <small>({this.state.word._id})</small>
            </h2>}
            {this.state.word && <ReactMarkdown source={this.state.word.source} />}
            {this.state.saving && <Spinner>Saving...</Spinner>}
          </header>
          {this.state.word && <WordForm value={this.state.word} onSubmit={this.updateWord} />}
          <Error error={this.state.error} />
        </section>
      )
  }
}

export default WordEditor
