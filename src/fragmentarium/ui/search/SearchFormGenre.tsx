import React from 'react'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import { GenreSearchHelp } from 'fragmentarium/ui/SearchHelp'
import SelectFormGroup from './SelectFromGroup'

interface GenreSearchFormGroupProps {
  value: string | null
  onChange: (value: string | null) => void
  fragmentService: FragmentService
}

const GenreSearchFormGroup = withData<
  GenreSearchFormGroupProps,
  { fragmentService: FragmentService },
  ReadonlyArray<ReadonlyArray<string>>
>(
  ({ data, value, onChange }) => {
    const options = data.map((genre) => ({
      value: genre.join(':'),
      label: genre.join(' ➝ '),
    }))

    return (
      <SelectFormGroup
        controlId="genre"
        helpOverlay={GenreSearchHelp()}
        placeholder="Genre"
        options={options}
        value={value}
        onChange={onChange}
        classNamePrefix="genre-selector"
      />
    )
  },
  (props) => props.fragmentService.fetchGenres()
)

export default GenreSearchFormGroup
