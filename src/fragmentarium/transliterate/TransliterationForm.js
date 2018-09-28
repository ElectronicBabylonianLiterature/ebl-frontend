import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl, Button, Grid, Row, Col } from 'react-bootstrap'
import _ from 'lodash'
import { Promise } from 'bluebird'

import ErrorAlert from 'ErrorAlert'
import TemplateForm from './TemplateForm'

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
    return this.props.fragmentService.allowedToTransliterate()
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
  }

  numberOfRows (property) {
    return this.state[property].split('\n').length
  }

  update = property => event => {
    this.setState({
      ...this.state,
      [property]: event.target.value
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
      disabled: true
    })
    this.updatePromise = this.props.fragmentService.updateTransliteration(
      this.props.number,
      this.state.transliteration,
      this.state.notes
    )
      .then(() => {
        this.setState({
          ...this.state,
          error: null,
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

  textArea = ({ property }) => (
    <FormGroup controlId={property}>
      <ControlLabel>{_.startCase(property)}</ControlLabel>
      <FormControl
        componentClass='textarea'
        value={this.state[property]}
        rows={this.numberOfRows(property)}
        onChange={this.update(property)} />
    </FormGroup>
  )

  form = () => (
    <form onSubmit={this.submit} id='transliteration-form'>
      <fieldset disabled={!this.editable}>
        <this.textArea property='transliteration' />
        <this.textArea property='notes' />
        <ErrorAlert error={this.state.error} />
      </fieldset>
    </form>
  )

  submitButton = () => (
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
            <this.form />
          </Col>
        </Row>
        {this.editable && <Row>
          <Col sm={6}>
            <this.submitButton />
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
