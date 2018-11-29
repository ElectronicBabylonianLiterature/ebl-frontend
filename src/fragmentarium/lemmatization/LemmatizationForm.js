import React, { Component } from 'react'
import AsyncSelect from 'react-select/lib/Async'
import Promise from 'bluebird'
import _ from 'lodash'

class LemmatizationForm extends Component {
  constructor (props) {
    super(props)
    this.state = this.createState()
  }

  createState = () => ({
    selectedOption: this.props.token.uniqueLemma.map(lemma => (
      { value: lemma, label: lemma }
    ))
  })

  loadOptions = (inputValue, callback) => {
    (inputValue.length > 0
      ? this.props.fragmentService.searchLemma(inputValue)
      : Promise.resolve([]))
      .then(words =>
        _(words)
          .map(word =>
            ({ value: word._id, label: word._id })
          )
          .value()
      )
      .then(callback)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (!_.isEqual(prevProps.token, this.props.token)) {
      this.setState(this.createState())
    }
  }

  handleChange = (selectedOption) => {
    this.setState({
      selectedOption
    })
    this.props.onChange(selectedOption)
  }

  render () {
    return <div>
      <header>{this.props.token.value}</header>
      <AsyncSelect
        cacheOptions
        defaultOptions={!!this.state.selectedOption && this.state.selectedOption}
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        value={this.state.selectedOption}
        isMulti
      />
    </div>
  }
}

export default LemmatizationForm
