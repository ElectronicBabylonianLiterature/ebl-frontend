import React, { Component } from 'react'
import AsyncSelect from 'react-select/lib/Async'
import _ from 'lodash'

function createLabel (entry) {
  const author = _.get(entry, 'author.0.family', 'unknown author')
  const year = _.get(entry, 'issued.date-parts.0.0', 'unknown year')
  const title = _.get(entry, 'title', 'no title')
  return `${author} ${year} ${title}`
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

  loadOptions = (inputValue, callback) => {
    this.props
      .searchBibliography(inputValue)
      .then(entries => entries.map(createOption))
      .then(callback)
  }

  handleChange = selectedOption => {
    this.setState({
      ...this.state,
      selectedOption
    })
    this.props.onChange(selectedOption.entry)
  }

  render () {
    return (<>
      <AsyncSelect
        aria-labelledby={this.props['aria-labelledby']}
        placeholder='Family Name + Year + First few characters of the title'
        cacheOptions
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        value={this.state.selectedOption}
      />
    </>)
  }
}
