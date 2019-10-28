import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
import Promise from 'bluebird'

import AppContent from 'common/AppContent'
import WordForm from './WordForm'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import withData, { WithoutData } from 'http/withData'
import SessionContext from 'auth/SessionContext'
import Word from 'dictionary/Word'
import { match } from 'react-router'

type Props = {
  match: match
  data: Word
  wordService
}
class WordEditor extends Component<Props, {word; error: Error | null; saving: boolean}> {
  static contextType = SessionContext

  private updatePromise: Promise<any>

  constructor(props) {
    super(props)
    this.state = {
      word: props.data,
      error: null,
      saving: false
    }
    this.updatePromise = Promise.resolve()
  }

  componentWillUnmount() {
    this.updatePromise.cancel()
  }

  get disabled() {
    return this.state.saving || !this.context.isAllowedToWriteWords()
  }

  updateWord = word => {
    this.updatePromise.cancel()
    this.setState({ word: this.state.word, error: null, saving: true })
    this.updatePromise = this.props.wordService
      .update(word)
      .then(() => this.setState({ word: word, error: null, saving: false }))
      .catch(error => {
        this.setState({ word: this.state.word, error: error, saving: false })
      })
  }

  render() {
    return (
      <AppContent
        crumbs={['Dictionary', this.props.match.params['id']]}
        title={
          <>
            Edit{' '}
            <strong>
              {this.state.word.attested === false && '*'}
              {this.state.word.lemma.join(' ')}
            </strong>{' '}
            {this.state.word.homonym}
          </>
        }
      >
        <ReactMarkdown source={this.state.word.source} />
        <Spinner loading={this.state.saving}>Saving...</Spinner>
        <WordForm
          value={this.state.word}
          onSubmit={this.updateWord}
          disabled={this.disabled}
        />
        <ErrorAlert error={this.state.error} />
      </AppContent>
    )
  }
}

export default withData<WithoutData<Props>,{}, Word>(WordEditor, props =>
  props.wordService.find(props.match.params['id'])
)
