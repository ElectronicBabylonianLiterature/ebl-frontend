import React, { Component } from 'react'
import { FormGroup, FormControl, Button, Grid, Row, Col } from 'react-bootstrap'
import Error from 'Error'
import TemplateForm from './TemplateForm'

class TransliteratioForm extends Component {
  state = {
    transliteration: this.props.transliteration,
    error: null,
    disabled: false
  }

  get rows () {
    return this.state.transliteration.split('\n').length
  }

  onChange = event => {
    this.setState({
      ...this.state,
      transliteration: event.target.value
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
      disabled: true
    })
    const path = `/fragments/${this.props.number}/transliteration`
    this.props.apiClient.postJson(path, this.state.transliteration)
      .then(() => {
        this.setState({
          ...this.state,
          error: null,
          disabled: false
        })
        this.props.onChange()
      })
      .catch(error => this.setState({
        ...this.state,
        error: error,
        disabled: false
      }))
  }

  form = () => (
    <form onSubmit={this.submit} id='transliteration-form'>
      <FormGroup controlId='transliteration'>
        <FormControl
          componentClass='textarea'
          aria-label='Transliteration'
          value={this.state.transliteration}
          rows={this.rows}
          onChange={this.onChange} />
      </FormGroup>
      <Error error={this.state.error} />
    </form>
  )

  submitButton = () => (
    <Button
      type='submit'
      bsStyle='primary'
      disabled={this.state.disabled}
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
        <Row>
          <Col sm={6}>
            <this.submitButton />
          </Col>
          <Col sm={6}>
            <TemplateForm onSubmit={this.onTemplate} />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default TransliteratioForm
