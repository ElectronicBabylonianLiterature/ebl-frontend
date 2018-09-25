import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
import Promise from 'bluebird'

import Breadcrumbs from 'Breadcrumbs'
import WordForm from './WordForm'
import Spinner from 'Spinner'
import ErrorAlert from 'ErrorAlert'
import withData from 'http/withData'

function getWordUrl (props) {
  return `/words/${props.match.params.id}`
}

class WordEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      word: props.data,
      error: null,
      saving: false
    }
    this.updatePromise = Promise.resolve()
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
  }

  updateWord = word => {
    this.updatePromise.cancel()
    this.setState({ word: this.state.word, error: null, saving: true })
    this.updatePromise = this.props.apiClient
      .postJson(getWordUrl(this.props), word)
      .then(() => this.setState({ word: word, error: null, saving: false }))
      .catch(error => {
        this.setState({ word: this.state.word, error: error, saving: false })
      })
  }

  render () {
    return (
      <section className='App-content'>
        <header>
          <Breadcrumbs section='Dictionary' active={this.props.match.params.id} />
          <h2>
            Edit <strong>{this.state.word.attested === false && '*'}{this.state.word.lemma.join(' ')}</strong> {this.state.word.homonym}
            {' '}
            <small>({this.state.word._id})</small>
          </h2>
          <ReactMarkdown source={this.state.word.source} />
          <Spinner loading={this.state.saving}>Saving...</Spinner>
        </header>
        <WordForm value={this.state.word} onSubmit={this.updateWord} disabled={this.state.saving || !this.props.auth.isAllowedTo('write:words')} />
        <ErrorAlert error={this.state.error} />
      </section>
    )
  }
}

export default withData(
  WordEditor,
  getWordUrl
)
