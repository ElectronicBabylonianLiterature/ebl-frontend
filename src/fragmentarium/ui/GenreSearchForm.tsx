import React from 'react'
import withData from 'http/withData'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import _ from 'lodash'
import './GenreSearchForm.sass'

export default withData<
  {
    onChange: (value: readonly string[]) => void
    value?: readonly string[] | null
  },
  { fragmentService: FragmentService },
  ReadonlyArray<ReadonlyArray<string>>
>(
  ({ data, value, onChange }) => {
    const options = data.map((genre) => ({
      value: genre,
      label: genre.join(' ➝ '),
    }))
    const defaultOption =
      !_.isNil(value) && !_.isEmpty(value)
        ? { value: value, label: value.join(' ➝ ') }
        : null

    return (
      <Select
        aria-label="select-genre"
        placeholder="Genre"
        options={options}
        value={defaultOption}
        onChange={(selection) => {
          onChange(selection?.value || [])
        }}
        isSearchable={true}
        autoFocus={true}
        classNamePrefix={'genre-selector'}
        isClearable
      />
    )
  },
  (props) => props.fragmentService.fetchGenres()
)
