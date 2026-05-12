import React from 'react'
import Select, { components, MultiValueProps } from 'react-select'
import { Form } from 'react-bootstrap'
import _ from 'lodash'
import { genres } from 'fragmentarium/domain/Genres'

export const NON_DEFINED_GENRE = 'Non defined'

interface Option {
  label: string
  value: string
}

const options: readonly Option[] = [
  { label: NON_DEFINED_GENRE, value: NON_DEFINED_GENRE },
  ...genres.map((genre) => ({ label: genre, value: genre })),
]

const separator = ' → '

const formatLabel = (label: string): React.ReactNode => {
  const parts = label.split(separator)
  if (parts.length > 2) {
    return (
      <span>
        {parts[0]}
        {separator}…{separator}
        {parts[parts.length - 1]}
      </span>
    )
  }
  return label
}

const MultiValue = (props: MultiValueProps<Option>) => {
  return (
    <components.MultiValue {...props}>
      <span style={{ marginRight: '4px' }}> {'\u00A0'} </span>
      {formatLabel(props.data.label)}
    </components.MultiValue>
  )
}

function SearchFormGenre({
  value,
  onChange,
}: {
  value: readonly string[]
  onChange: (value: readonly string[]) => void
}): JSX.Element {
  const handleChange = (selectedOptions: ReadonlyArray<Option> | null) => {
    onChange(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    )
  }

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  )

  return (
    <Form.Group controlId="genres">
      <Form.Label>Genre</Form.Label>
      <Select
        isMulti
        name="genres"
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        formatOptionLabel={({ label }, { context }) =>
          context === 'value' ? label : formatLabel(label)
        }
        components={{ MultiValue }}
        placeholder="Genres"
        classNamePrefix="react-select"
      />
    </Form.Group>
  )
}

export default SearchFormGenre