import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import React, { Component } from 'react'
import AsyncSelect from 'react-select/async'

function createLabel(entry: BibliographyEntry): string {
  const containerShort = entry.shortContainerTitle
  const collectionNumber = entry.collectionNumber
    ? ` ${entry.collectionNumber} `
    : ' '
  const label = `${entry.primaryAuthor} ${entry.year} ${entry.title}`
  return containerShort
    ? `${containerShort}${collectionNumber}= ${label}`
    : label
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
  { value; searchBibliography; onChange; isClearable },
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
    if (selectedOption) {
      this.setState({
        selectedOption,
      })
      this.props.onChange(selectedOption.entry)
    } else {
      this.props.onChange(new BibliographyEntry())
    }
  }

  render() {
    return (
      <>
        <AsyncSelect
          isClearable={this.props.isClearable}
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
