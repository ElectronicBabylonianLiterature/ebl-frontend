import React, { Component } from 'react'
import { Col, Form, Checkbox, FormGroup } from 'react-bootstrap'
import AsyncSelect from 'react-select/lib/Async'
import _ from 'lodash'
import Lemma from './Lemma'

class LemmatizationForm extends Component {
  constructor (props) {
    super(props)
    this.state = this.createState()
  }

  createState = () => {
    const isComplex = this.props.token.uniqueLemma.length > 1
    const singleLemmaToOption = () => this.props.token.uniqueLemma.length === 1
      ? this.props.token.uniqueLemma[0]
      : null

    return {
      isComplex: isComplex,
      selectedOption: isComplex ? this.props.token.uniqueLemma : singleLemmaToOption()
    }
  }

  loadOptions = (inputValue, callback) => {
    this.props.fragmentService.searchLemma(inputValue)
      .then(words => words.map(word => new Lemma(word)))
      .then(callback)
  }

  handleChange = selectedOption => {
    this.setState({
      ...this.state,
      selectedOption
    })
    this.props.onChange(_.isNil(selectedOption)
      ? []
      : (_.isArray(selectedOption)
        ? selectedOption
        : [selectedOption]
      ))
  }

  render () {
    const label = this.state.isComplex ? 'Lemmata' : 'Lemma'
    return (
      <Form horizontal>
        <FormGroup>
          <Col md={9}>
            <AsyncSelect
              aria-label={label}
              placeholder={label}
              cacheOptions
              isClearable
              autoFocus={this.props.autoFocus}
              loadOptions={this.loadOptions}
              onChange={this.handleChange}
              value={this.state.selectedOption}
              isMulti={this.state.isComplex}
            />
          </Col>
          <Col md={3}>
            <Checkbox
              disabled={this.props.token.uniqueLemma.length > 1}
              checked={this.state.isComplex}
              onChange={() => this.setState({
                ...this.state,
                isComplex: !this.state.isComplex
              })}>
              Complex
            </Checkbox>
          </Col>
        </FormGroup>
      </Form>
    )
  }
}

export default LemmatizationForm
