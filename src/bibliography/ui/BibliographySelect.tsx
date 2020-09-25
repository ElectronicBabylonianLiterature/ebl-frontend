import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'

function createLabel(entry) {
  return `${entry.primaryAuthor} ${entry.year} ${entry.title}`
}

function createOption(entry) {
  return entry && entry.id
    ? {
        value: entry.id,
        label: entry.label ? entry.label : createLabel(entry),
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
      selectedOption: createOption(props.value),
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.value !== prevProps.value) {
      this.setState({
        selectedOption: createOption(this.props.value),
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
      selectedOption,
    })
    this.props.onChange(selectedOption.entry)
  }

  render() {
    return (
      <>
        <AsyncSelect
          isClearable
          aria-label={this.props['aria-label']}
          placeholder="Name Year Title"
          cacheOptions
          loadOptions={this.loadOptions}
          onChange={this.handleChange}
          value={this.state.selectedOption}
        />
      </>
    )
  }
}
