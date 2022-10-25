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
  updateTransliteration: (
    transliteration: string,
    notes: string
  ) => Promise<Fragment>
  updateIntroduction: (introduction: string) => Promise<Fragment>
  disabled: boolean
}
type State = {
  transliteration: string
  notes: string
  introduction: string
  error: Error | null
  disabled: boolean
}
function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
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

  componentWillUnmount(): void {
    this.updatePromise.cancel()
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
    this.updatePromise = Promise.all([
      this.props.updateTransliteration(
        this.state.transliteration,
        this.state.notes
      ),
      this.props.updateIntroduction(this.state.introduction.trim()),
    ])
      .then(([transliterationFragment, introductionFragment]) => {
        this.setState({
          ...this.state,
          transliteration: transliterationFragment.atf,
          notes: transliterationFragment.notes,
          introduction: introductionFragment.introduction.text,
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
                {['transliteration', 'notes', 'introduction'].map(
                  (name, index) => (
                    <FormGroup controlId={`${this.formId}-${name}`} key={index}>
                      <FormLabel>{capitalize(name)}</FormLabel>{' '}
                      {name === 'transliteration' && <SpecialCharactersHelp />}
                      <Editor
                        name={name}
                        value={this.state[name]}
                        onChange={this.update(name)}
                        disabled={this.props.disabled}
                        error={
                          name === 'transliteration'
                            ? this.state.error
                            : undefined
                        }
                      />
                    </FormGroup>
                  )
                )}
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
