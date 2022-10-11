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
  introduction: string
  updateIntroduction: (introduction: string) => Promise<Fragment>
  disabled: boolean
}
type State = {
  introduction: string
  error: Error | null
  disabled: boolean
}
class IntroductionForm extends Component<Props, State> {
  static readonly defaultProps = {
    disabled: false,
  }

  private readonly formId: string
  private updatePromise: Promise<void>

  constructor(props: Props) {
    super(props)
    this.formId = _.uniqueId('IntroductionForm-')
    this.state = {
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
    const introductionChanged =
      this.state.introduction !== this.props.introduction
    return introductionChanged
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
      introduction: template,
    })
  }

  submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    this.setState({
      ...this.state,
      error: null,
    })
    this.updatePromise = this.props
      .updateIntroduction(this.state.introduction)
      .then((fragment) =>
        this.setState({
          ...this.state,
          introduction: fragment.atf,
        })
      )
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
                  <FormLabel>Introduction</FormLabel> <SpecialCharactersHelp />
                  <Editor
                    name="introduction"
                    value={this.state.introduction}
                    onChange={this.update('transliteration')}
                    disabled={this.props.disabled}
                    error={this.state.error}
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

export default IntroductionForm
