import React, { Component } from 'react'
import { Checkbox, FormGroup } from 'react-bootstrap'
import AsyncSelect from 'react-select/lib/Async'
import _ from 'lodash'
import Lemma from './Lemma'

class LemmatizationForm extends Component {
  constructor (props) {
    super(props)
    this.state = this.createState()
  }

  createState = () => {
    const multi = this.props.token.uniqueLemma.length > 1
    const singleLemmaToOption = () => this.props.token.uniqueLemma.length === 1
      ? this.props.token.uniqueLemma[0]
      : null

    return {
      multi: multi,
      selectedOption: multi ? this.props.token.uniqueLemma : singleLemmaToOption()
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
    const label = this.state.multi ? 'Lemmata' : 'Lemma'
    return (
      <form>
        <FormGroup>
          <Checkbox
            disabled={this.props.token.uniqueLemma.length > 1}
            checked={this.state.multi}
            onChange={() => this.setState({ ...this.state, multi: !this.state.multi })}>
            Multiple
          </Checkbox>
        </FormGroup>
        <FormGroup>
          <AsyncSelect
            aria-label={label}
            placeholder={label}
            cacheOptions
            isClearable
            loadOptions={this.loadOptions}
            onChange={this.handleChange}
            value={this.state.selectedOption}
            isMulti={this.state.multi}
          />
        </FormGroup>
      </form>
    )
  }
}

export default LemmatizationForm
