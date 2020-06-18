import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'

function createLabel(entry) {
  return `${entry.primaryAuthor} ${entry.year} ${entry.title}`
}

function createOption(entry) {
  return entry && entry.id
    ? {
        value: entry.id,
        label: createLabel(entry),
        entry: entry,
      }
    : null
}

export default class BibliographySelect extends Component<
  { value; searchBibliography; onChange },
  { selectedOption }
> {
  constructor(props) {
    super(props)
    this.state = {
      selectedOption: props.value,
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.value !== prevProps.value) {
      this.setState({
        selectedOption: this.props.value,
      })
    }
  }

  loadOptions = (inputValue, callback) => {
    this.props
      .searchBibliography(inputValue)
      .then((entries) => entries.map(createOption))
      .then(callback)
  }

  handleChange = (selectedOption) => {
    this.setState({
      selectedOption: selectedOption.label,
    })
    this.props.onChange('title', selectedOption.label)
    this.props.onChange('id', selectedOption.entry.cslData.id)
  }

  render() {
    return (
      <>
        <AsyncSelect
          aria-labelledby={this.props['aria-labelledby']}
          placeholder="Name Year Title"
          cacheOptions
          loadOptions={this.loadOptions}
          onChange={this.handleChange}
          value={{ value: 1, label: this.state.selectedOption }}
        />
      </>
    )
  }
}
