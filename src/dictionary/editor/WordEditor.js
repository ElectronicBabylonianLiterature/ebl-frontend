import React, { Component } from 'react'
import { Alert, Breadcrumb } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

import WordForm from './WordForm'
import Spinner from '../../Spinner'

class WordEditor extends Component {
  state = {
    word: null,
    error: null,
    saving: false
  }

  get wordUrl () {
    return `${process.env.REACT_APP_DICTIONARY_API_URL}/words/${this.props.match.params.id}`
  }

  componentDidMount () {
    this.props.httpClient
      .fetchJson(this.wordUrl)
      .then(json => this.setState({word: json, error: null, saving: false}))
      .catch(error => this.setState({word: null, error: error, saving: false}))
  }

  updateWord = word => {
    this.setState({word: this.state.word, error: null, saving: true})
    this.props.httpClient
      .postJson(this.wordUrl, word)
      .then(() => this.setState({word: word, error: null, saving: false}))
      .catch(error => this.setState({word: this.state.word, error: error, saving: false}))
  }

  render () {
    if (this.state.word || this.state.error) {
      return (
        <section className='WordEditor'>
          <header>
            <Breadcrumb separator='/'>
              <Breadcrumb.Item href='/'>eBL</Breadcrumb.Item>
              <Breadcrumb.Item href='/dictionary'>Dictionary</Breadcrumb.Item>
              <Breadcrumb.Item active>{this.props.match.params.id}</Breadcrumb.Item>
            </Breadcrumb>
            {this.state.word && <h2>
              Edit <strong>{this.state.word.attested === false && '*'}{this.state.word.lemma.join(' ')}</strong> {this.state.word.homonym}
              <small>({this.state.word._id})</small>
            </h2>}
            {this.state.word && <ReactMarkdown source={this.state.word.source} />}
            {this.state.saving && <Spinner>Saving...</Spinner>}
          </header>
          {this.state.word && <WordForm value={this.state.word} onSubmit={this.updateWord} />}
          {this.state.error && <Alert bsStyle='danger'>{this.state.error.message}</Alert>}
        </section>
      )
    } else {
      return <section><Spinner /></section>
    }
  }
}

export default WordEditor
