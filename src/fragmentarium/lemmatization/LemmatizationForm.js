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
    selectedOption: this.props.value.uniqueLemma
      ? { value: this.props.value.uniqueLemma, label: this.props.value.uniqueLemma }
      : null
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
          .take(10)
          .value()
      )
      .then(callback)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (!_.isEqual(prevProps.value, this.props.value)) {
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
      <header>{this.props.value.token}</header>
      <AsyncSelect
        cacheOptions
        defaultOptions={!!this.state.selectedOption && [this.state.selectedOption]}
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        value={this.state.selectedOption}
      />
    </div>
  }
}

export default LemmatizationForm
