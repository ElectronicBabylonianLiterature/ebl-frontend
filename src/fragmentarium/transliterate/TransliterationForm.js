import React, { Component } from 'react'
import { FormGroup, ControlLabel, Button, Grid, Row, Col } from 'react-bootstrap'
import AceEditor from 'react-ace'
import _ from 'lodash'
import { Promise } from 'bluebird'

import ErrorAlert from 'common/ErrorAlert'
import TemplateForm from './TemplateForm'

import 'brace/mode/plain_text'
import 'brace/theme/kuroir'

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

  numberOfRows (property) {
    return this.state[property].split('\n').length
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

  Editor = ({ property }) => (
    <FormGroup controlId={property}>
      <ControlLabel>{_.startCase(property)}</ControlLabel>
      <AceEditor
        name={property}
        width='100%'
        heigth='auto'
        minLines={2}
        maxLines={Math.max(2, this.numberOfRows(property))}
        mode='plain_text'
        theme='kuroir'
        value={this.state[property]}
        onChange={this.update(property)}
        showPrintMargin={false}
        showGutter={false}
        wrapEnabled
        fontSize='initial'
        readOnly={this.state.disabled}
        editorProps={{
          $blockScrolling: Infinity
        }}
      />
    </FormGroup>
  )

  Form = () => (
    <form onSubmit={this.submit} id='transliteration-form'>
      <fieldset disabled={!this.editable}>
        <this.Editor property='transliteration' />
        <this.Editor property='notes' />
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
