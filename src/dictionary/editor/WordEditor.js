import React, { Component } from 'react'
import { Alert, Breadcrumb } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

import WordForm from './WordForm'
import Spinner from '../../Spinner'

class WordEditor extends Component {
  constructor (props) {
    super(props)

    this.state = {
      word: null,
      error: null
    }

    this.load()
  }

  load () {
    this.props.httpClient
      .fetchJson(`${process.env.REACT_APP_DICTIONARY_API_URL}/words/${this.props.match.params.id}`)
      .then(json => this.setState({word: json, error: null}))
      .catch(error => this.setState({word: null, error: error}))
  }

  render () {
    if (this.state.word) {
      return (
        <section className='WordEditor'>
          <header>
            <Breadcrumb separator='/'>
              <Breadcrumb.Item href='/'>eBL</Breadcrumb.Item>
              <Breadcrumb.Item href='/dictionary'>Dictionary</Breadcrumb.Item>
              <Breadcrumb.Item active>{this.props.match.params.id}</Breadcrumb.Item>
            </Breadcrumb>
            <h2>Edit <strong>{this.state.word.attested === false && '*'}{this.state.word.lemma.join(' ')}</strong> {this.state.word.homonym} <small>({this.state.word._id})</small></h2>
            <ReactMarkdown source={this.state.word.source} />
          </header>
          <WordForm value={this.state.word} />
        </section>
      )
    } else if (this.state.error) {
      return <Alert bsStyle='danger'>{this.state.error.message}</Alert>
    } else {
      return <Spinner />
    }
  }
}

export default WordEditor
