import React, { Component } from 'react'
import { FormGroup, ControlLabel, Button, Grid, Row, Col } from 'react-bootstrap'
import _ from 'lodash'
import { Promise } from 'bluebird'

import ErrorAlert from 'common/ErrorAlert'
import Editor from './Editor'
import TemplateForm from './TemplateForm'
import HelpTrigger from 'common/HelpTrigger'
import SpecialCharactersHelp from './SpecialCharactersHelp'

class TransliteratioForm extends Component {
  constructor (props) {
    super(props)
    this.updatePromise = Promise.resolve()
  }

  state = {
    transliteration: this.props.transliteration,
    notes: this.props.notes,
    error: null,
    disabled: false
  }

  get hasChanges () {
    const transliterationChanged = this.state.transliteration !== this.props.transliteration
    const notesChanged = this.state.notes !== this.props.notes
    return transliterationChanged || notesChanged
  }

  get editable () {
    return this.props.fragmentService.isAllowedToTransliterate()
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
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
    this.updatePromise.cancel()
    this.setState({
      ...this.state,
      disabled: true,
      error: null
    })
    this.updatePromise = this.props.fragmentService.updateTransliteration(
      this.props.number,
      this.state.transliteration,
      this.state.notes
    )
      .then(() => {
        this.setState({
          ...this.state,
          disabled: false
        })
        this.props.onChange()
      })
      .catch(error => {
        this.setState({
          ...this.state,
          error: error,
          disabled: false
        })
      })
  }

  EditorFormGroup = ({ property, error, showHelp }) => (
    <FormGroup controlId={property}>
      <ControlLabel>{_.startCase(property)}</ControlLabel>
      {' '}
      {showHelp && <HelpTrigger overlay={SpecialCharactersHelp()} /> }
      <Editor
        name={property}
        value={this.state[property]}
        onChange={this.update(property)}
        disabled={!this.editable || this.state.disabled}
        error={error}
      />
    </FormGroup>
  )

  Form = () => (
    <form onSubmit={this.submit} id='transliteration-form'>
      <fieldset disabled={!this.editable}>
        <this.EditorFormGroup property='transliteration' error={this.state.error} showHelp />
        <this.EditorFormGroup property='notes' />
        <ErrorAlert error={this.state.error} />
      </fieldset>
    </form>
  )

  SubmitButton = () => (
    <Button
      type='submit'
      bsStyle='primary'
      disabled={this.state.disabled || !this.hasChanges}
      form='transliteration-form'>
      Save
    </Button>
  )

  render () {
    return (
      <Grid fluid>
        <Row>
          <Col sm={12}>
            <this.Form />
          </Col>
        </Row>
        {this.editable && <Row>
          <Col sm={6}>
            <this.SubmitButton />
          </Col>
          <Col sm={6}>
            <TemplateForm onSubmit={this.onTemplate} />
          </Col>
        </Row>}
      </Grid>
    )
  }
}

export default TransliteratioForm
