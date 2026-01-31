import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
import Promise from 'bluebird'

import AppContent from 'common/AppContent'
import WordForm from './WordForm'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import withData, { WithoutData } from 'http/withData'
import SessionContext from 'auth/SessionContext'
import Word from 'dictionary/domain/Word'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'

type Props = {
  data: Word
  wordService
  id: string
}

class WordEditor extends Component<
  Props,
  { word: Word; error: Error | null; saving: boolean }
> {
  static contextType = SessionContext

  private updatePromise: Promise<void>

  constructor(props) {
    super(props)
    this.state = {
      word: props.data,
      error: null,
      saving: false,
    }
    this.updatePromise = Promise.resolve()
  }

  componentWillUnmount(): void {
    this.updatePromise.cancel()
  }

  get disabled(): boolean {
    return this.state.saving || !this.context.isAllowedToWriteWords()
  }

  updateWord = (word): void => {
    this.updatePromise.cancel()
    this.setState({ word: this.state.word, error: null, saving: true })
    this.updatePromise = this.props.wordService
      .update(word)
      .then(() => this.setState({ word: word, error: null, saving: false }))
      .catch((error) => {
        this.setState({ word: this.state.word, error: error, saving: false })
      })
  }

  render(): JSX.Element {
    return (
      <AppContent
        crumbs={[new SectionCrumb('Dictionary'), new TextCrumb(this.props.id)]}
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
        <p>Origin: {this.state.word.origin}</p>
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

export default withData<WithoutData<Props>, unknown, Word>(
  WordEditor,
  (props) => props.wordService.find(props.id),
)
