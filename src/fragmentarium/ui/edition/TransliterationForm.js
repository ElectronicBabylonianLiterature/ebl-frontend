import React, { Component } from 'react'
import {
  FormGroup,
  FormLabel,
  Button,
  Container,
  Row,
  Col
} from 'react-bootstrap'
import _ from 'lodash'
import { Promise } from 'bluebird'

import Editor from 'editor/Editor'
import SpecialCharactersHelp from 'editor/SpecialCharactersHelp'
import TemplateForm from './TemplateForm'

class TransliteratioForm extends Component {
  constructor(props) {
    super(props)
    this.formId = _.uniqueId('TransliteratioForm-')
    this.state = {
      transliteration: this.props.transliteration,
      notes: this.props.notes,
      error: null
    }
    this.updatePromise = Promise.resolve()
  }

  componentWillUnmount() {
    this.updatePromise.cancel()
  }

  get hasChanges() {
    const transliterationChanged =
      this.state.transliteration !== this.props.transliteration
    const notesChanged = this.state.notes !== this.props.notes
    return transliterationChanged || notesChanged
  }

  update = property => value => {
    this.setState({
      ...this.state,
      [property]: value
    })
  }

  onTemplate = template => {
    this.setState({
      ...this.state,
      transliteration: template
    })
  }

  submit = event => {
    event.preventDefault()
    this.setState({
      ...this.state,
      error: null
    })
    this.updatePromise = this.props
      .updateTransliteration(this.state.transliteration, this.state.notes)
      .catch(error =>
        this.setState({
          ...this.state,
          error: error
        })
      )
  }

  EditorFormGroup = ({ property, error, showHelp }) => (
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

  Form = () => (
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

  SubmitButton = () => (
    <Button
      type="submit"
      variant="primary"
      disabled={this.state.disabled || !this.hasChanges}
      form={this.formId}
    >
      Save
    </Button>
  )

  render() {
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
