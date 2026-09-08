import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'

import AppContent from 'common/ui/AppContent'
import WordForm from './WordForm'
import Spinner from 'common/ui/Spinner'
import ErrorAlert from 'common/errors/ErrorAlert'
import withData, { WithoutData } from 'http/withData'
import SessionContext from 'auth/SessionContext'
import Word from 'dictionary/domain/Word'
import { SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'
import SupersedableOperation from 'common/utils/SupersedableOperation'
import applyWhenCurrent from 'common/utils/applyWhenCurrent'

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
  context!: React.ContextType<typeof SessionContext>

  private readonly updateOperation = new SupersedableOperation()

  constructor(props) {
    super(props)
    this.state = {
      word: props.data,
      error: null,
      saving: false,
    }
  }

  componentWillUnmount(): void {
    this.updateOperation.supersede()
  }

  get disabled(): boolean {
    return this.state.saving || !this.context.isAllowedToWriteWords()
  }

  updateWord = (word: Word): void => {
    this.setState({ word: this.state.word, error: null, saving: true })
    applyWhenCurrent(() => this.props.wordService.update(word), {
      onSuccess: () => {
        this.setState({ word: word, error: null, saving: false })
      },
      onError: (error) => {
        this.setState({ word: this.state.word, error: error, saving: false })
      },
    })(this.updateOperation.start())
  }

  render(): JSX.Element {
    return (
      <AppContent
        crumbs={[
          new SectionCrumb('Akkadian Dictionary'),
          new TextCrumb(this.props.id),
        ]}
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
        <ReactMarkdown>{this.state.word.source ?? ''}</ReactMarkdown>
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
  (props, signal) => props.wordService.find(props.id, signal),
)
