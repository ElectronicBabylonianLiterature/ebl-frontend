import React, { Component, FormEvent } from 'react'
import {
  FormGroup,
  FormLabel,
  Button,
  Container,
  Row,
  Col,
} from 'react-bootstrap'
import _ from 'lodash'
import Promise from 'bluebird'

import Editor from 'editor/Editor'
import SpecialCharactersHelp from 'editor/SpecialCharactersHelp'
import TemplateForm from './TemplateForm'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ErrorBoundary } from '@sentry/react'

type Props = {
  transliteration: string
  notes: string
  introduction: string
  updateEdition: (
    transliteration: string,
    notes: string,
    introduction: string
  ) => Promise<Fragment>
  disabled: boolean
}
type State = {
  transliteration: string
  notes: string
  introduction: string
  error: Error | null
  disabled: boolean
}
class TransliterationForm extends Component<Props, State> {
  static readonly defaultProps = {
    disabled: false,
  }

  private readonly formId: string
  private updatePromise: Promise<void>

  constructor(props: Props) {
    super(props)
    this.formId = _.uniqueId('TransliterationForm-')
    this.state = {
      transliteration: this.props.transliteration,
      notes: this.props.notes,
      introduction: this.props.introduction,
      error: null,
      disabled: false,
    }
    this.updatePromise = Promise.resolve()
  }

  componentDidMount(): void {
    this.setupBeforeUnloadListener()
  }
  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (
      this.hasChanges !==
      (prevState.transliteration !== prevProps.transliteration ||
        prevState.notes !== prevProps.notes ||
        prevState.introduction !== prevProps.introduction)
    ) {
      this.setupBeforeUnloadListener()
    }
  }
  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    this.updatePromise.cancel()
  }
  setupBeforeUnloadListener = (): void => {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    if (this.hasChanges) {
      window.addEventListener('beforeunload', this.handleBeforeUnload)
    }
  }
  handleBeforeUnload = (e: BeforeUnloadEvent): string => {
    const confirmationMessage =
      'You have unsaved changes. Are you sure you want to leave?'
    e.returnValue = confirmationMessage
    return confirmationMessage
  }

  get hasChanges(): boolean {
    const transliterationChanged =
      this.state.transliteration !== this.props.transliteration
    const notesChanged = this.state.notes !== this.props.notes
    const introductionChanged =
      this.state.introduction !== this.props.introduction
    return transliterationChanged || notesChanged || introductionChanged
  }

  update = (property: string) => (value: string): void => {
    this.setState({
      ...this.state,
      [property]: value,
    })
  }

  onTemplate = (template: string): void => {
    this.setState({
      ...this.state,
      transliteration: template,
    })
  }

  submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    this.setState({
      ...this.state,
      error: null,
    })
    this.updatePromise = this.props
      .updateEdition(
        this.state.transliteration,
        this.state.notes,
        this.state.introduction
      )
      .then((fragment) => {
        this.setState({
          ...this.state,
          transliteration: fragment.atf,
          notes: fragment.notes.text,
          introduction: fragment.introduction.text,
        })
      })
      .catch((error) =>
        this.setState({
          ...this.state,
          error: error,
        })
      )
  }

  SubmitButton = (): JSX.Element => (
    <Button
      type="submit"
      variant="primary"
      disabled={this.state.disabled || !this.hasChanges}
      form={this.formId}
    >
      Save
    </Button>
  )

  render(): JSX.Element {
    return (
      <Container fluid>
        <Row>
          <Col>
            <ErrorBoundary>
              <form
                onSubmit={this.submit}
                id={this.formId}
                data-testid="transliteration-form"
              >
                <FormGroup controlId={`${this.formId}-transliteration`}>
                  <FormLabel>Transliteration</FormLabel>{' '}
                  <SpecialCharactersHelp />
                  <Editor
                    name="transliteration"
                    value={this.state.transliteration}
                    onChange={this.update('transliteration')}
                    disabled={this.props.disabled}
                    error={this.state.error}
                  />
                </FormGroup>
                <FormGroup controlId={`${this.formId}-notes`}>
                  <FormLabel>Notes</FormLabel>{' '}
                  <Editor
                    name="notes"
                    value={this.state.notes}
                    onChange={this.update('notes')}
                    disabled={this.props.disabled}
                  />
                </FormGroup>
                <FormGroup controlId={`${this.formId}-introduction`}>
                  <FormLabel>Introduction</FormLabel>{' '}
                  <Editor
                    name="introduction"
                    value={this.state.introduction}
                    onChange={this.update('introduction')}
                    disabled={this.props.disabled}
                  />
                </FormGroup>
              </form>
            </ErrorBoundary>
          </Col>
        </Row>
        <Row>
          <Col>
            <this.SubmitButton />
          </Col>
          <Col md="auto">
            <ErrorBoundary>
              <TemplateForm onSubmit={this.onTemplate} />
            </ErrorBoundary>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default TransliterationForm
