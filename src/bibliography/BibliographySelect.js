import React, { Component } from 'react'
import AsyncSelect from 'react-select/lib/Async'

function createLabel (entry) {
  return `${entry.author} ${entry.year} ${entry.title}`
}

function createOption (entry) {
  return (entry && entry.id)
    ? {
      value: entry.id,
      label: createLabel(entry),
      entry: entry
    }
    : null
}

export default class BibliographySelect extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedOption: createOption(props.value)
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.value !== prevProps.value) {
      this.setState({
        selectedOption: createOption(this.props.value)
      })
    }
  }

  loadOptions = (inputValue, callback) => {
    this.props
      .searchBibliography(inputValue)
      .then(entries => entries.map(createOption))
      .then(callback)
  }

  handleChange = selectedOption => {
    this.setState({
      selectedOption
    })
    this.props.onChange(selectedOption.entry)
  }

  render () {
    return (<>
      <AsyncSelect
        aria-labelledby={this.props['aria-labelledby']}
        placeholder='Name Year Title'
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        value={this.state.selectedOption}
      />
    </>)
  }
}
