import React, { Component } from 'react'
import { Checkbox, FormGroup } from 'react-bootstrap'
import AsyncSelect from 'react-select/lib/Async'
import _ from 'lodash'

class LemmatizationForm extends Component {
  constructor (props) {
    super(props)
    this.state = this.createState()
  }

  createState = () => {
    const multi = this.props.token.uniqueLemma.length > 1
    const multiLemmaToOption = () => this.props.token.uniqueLemma.map(lemma => (
      { value: lemma, label: lemma }
    ))
    const singleLemmaToOption = () => this.props.token.uniqueLemma.length === 1
      ? { value: this.props.token.uniqueLemma[0], label: this.props.token.uniqueLemma[0] }
      : null

    return {
      multi: multi,
      selectedOption: multi ? multiLemmaToOption() : singleLemmaToOption()
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

  handleChange = selectedOption => {
    this.setState({
      ...this.state,
      selectedOption
    })
    this.props.onChange(_.isNil(selectedOption)
      ? []
      : (_.isArray(selectedOption)
        ? selectedOption.map(option => option.value)
        : [selectedOption.value]
      ))
  }

  render () {
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
            aria-label={this.state.multi ? 'Lemmata' : 'Lemma'}
            placeholder={this.state.multi ? 'Lemmata' : 'Lemma'}
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
