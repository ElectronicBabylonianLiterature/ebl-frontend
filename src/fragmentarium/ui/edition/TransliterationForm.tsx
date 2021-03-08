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

type Props = {
  transliteration: string
  notes: string
  updateTransliteration: (
    transliteration: string,
    notes: string
  ) => Promise<Fragment>
  disabled: boolean
}
type State = {
  transliteration: string
  notes: string
  error: Error | null
  disabled: boolean
}
class TransliteratioForm extends Component<Props, State> {
  static readonly defaultProps = {
    disabled: false,
  }

  private readonly formId: string
  private updatePromise: Promise<void>

  constructor(props: Props) {
    super(props)
    this.formId = _.uniqueId('TransliteratioForm-')
    this.state = {
      transliteration: this.props.transliteration,
      notes: this.props.notes,
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
    return transliterationChanged || notesChanged
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
      .updateTransliteration(this.state.transliteration, this.state.notes)
      .then((fragment) =>
        this.setState({
          ...this.state,
          transliteration: fragment.atf,
          notes: fragment.notes,
        })
      )
      .catch((error) =>
        this.setState({
          ...this.state,
          error: error,
        })
      )
  }

  EditorFormGroup = ({
    property,
    error = null,
    showHelp = false,
  }: {
    property: string
    error?: Error | null
    showHelp?: boolean
  }): JSX.Element => (
    <FormGroup controlId={`${this.formId}-${property}`}>
      <FormLabel>{_.startCase(property)}</FormLabel>{' '}
      {showHelp && <SpecialCharactersHelp />}
      <Editor
        name={property}
        value={this.state[property]}
        onChange={this.update(property)}
        disabled={this.props.disabled}
        error={error}
      />
    </FormGroup>
  )

  Form = (): JSX.Element => (
    <form
      onSubmit={this.submit}
      id={this.formId}
      data-testid="transliteration-form"
    >
      <this.EditorFormGroup
        property="transliteration"
        error={this.state.error}
        showHelp
      />
      <this.EditorFormGroup property="notes" />
    </form>
  )

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
            <this.Form />
          </Col>
        </Row>
        <Row>
          <Col>
            <this.SubmitButton />
          </Col>
          <Col md="auto">
            <TemplateForm onSubmit={this.onTemplate} />
          </Col>
        </Row>
      </Container>
    )
  }
}

export default TransliteratioForm
