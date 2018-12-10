import React, { Component } from 'react'
import { Checkbox, FormGroup, Col } from 'react-bootstrap'
import AsyncSelect from 'react-select/lib/Async'
import _ from 'lodash'

class LemmatizationForm extends Component {
  constructor (props) {
    super(props)
    this.state = this.createState()
  }

  createState = () => {
    const multi = this.props.token.uniqueLemma.length > 1
    return {
      multi: multi,
      selectedOption: multi
        ? this.props.token.uniqueLemma.map(lemma => (
          { value: lemma, label: lemma }
        ))
        : { value: this.props.token.uniqueLemma[0], label: this.props.token.uniqueLemma[0] }
    }
  }

  loadOptions = (inputValue, callback) => {
    this.props.fragmentService.searchLemma(inputValue)
      .then(words =>
        words.map(word => ({
          value: word._id,
          label: `${word._id}, ${
            _.truncate(word.meaning.replace(/\*|\\/g, ''), {
              separator: ' ',
              omission: '…'
            })
          }`
        }))
      )
      .then(callback)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.token !== this.props.token) {
      this.setState(this.createState())
    }
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
    return (
      <form>
        <header>
          {this.props.token.value}
        </header>
        <label id='lemma-label'>{this.state.multi ? 'Lemmata' : 'Lemma'}</label>
        <FormGroup>
          <Col md={8}>
            <AsyncSelect
              aria-labelledby='lemma-label'
              cacheOptions
              isClearable
              loadOptions={this.loadOptions}
              onChange={this.handleChange}
              value={this.state.selectedOption}
              isMulti={this.state.multi}
            />
          </Col>
          <Col md={4}>
            <Checkbox
              disabled={this.props.token.uniqueLemma.length > 1}
              checked={this.state.multi}
              onChange={() => this.setState({ ...this.state, multi: !this.state.multi })}>
              Multiple
            </Checkbox>
          </Col>
        </FormGroup>
      </form>
    )
  }
}

export default LemmatizationForm
