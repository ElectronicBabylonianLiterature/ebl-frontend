import React, { Component } from 'react'
import { Loading, Alert, Collapse, Breadcrumb } from 'element-react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

import './WordEditor.css'
import WordForm from './WordForm'

class WordEditor extends Component {
  constructor (props) {
    super(props)

    this.state = {
      word: null,
      error: null
    }

    this.load()
  }

  async load () {
    try {
      const headers = new Headers({'Authorization': `Bearer ${this.props.auth.getAccessToken()}`})
      await fetch(`${process.env.REACT_APP_DICTIONARY_API_URL}/words/${this.props.match.params.id}`, {headers: headers})
        .then(response => {
          if (response.ok) {
            return response
          } else {
            throw Error(response.statusText)
          }
        })
        .then(response => response.json())
        .then(json => {
          this.setState({word: json, error: null})
        })
    } catch (error) {
      this.setState({word: null, error: error})
    }
  }

  render () {
    if (this.state.word) {
      return (
        <section className='WordEditor'>
          <header>
            <Breadcrumb separator='/'>
              <Breadcrumb.Item><Link to='/'>eBL</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to='/dictionary'>Dictionary</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{this.props.match.params.id}</Breadcrumb.Item>
            </Breadcrumb>
            <h2>Edit <strong>{this.state.word.attested === false && '*'}{this.state.word.lemma.join(' ')}</strong> {this.state.word.homonym} ({this.state.word._id})</h2>
            <ReactMarkdown source={this.state.word.source} />
          </header>
          <WordForm value={this.state.word} />
          <Collapse>
            <Collapse.Item title='JSON preview'>
              <pre>
                {JSON.stringify(this.state.word, null, 2)}
              </pre>
            </Collapse.Item>
          </Collapse>
        </section>
      )
    } else if (this.state.error) {
      return <Alert type='error' title={this.state.error.message} showIcon closable={false} />
    } else {
      return <Loading fullscreen />
    }
  }
}

export default WordEditor
