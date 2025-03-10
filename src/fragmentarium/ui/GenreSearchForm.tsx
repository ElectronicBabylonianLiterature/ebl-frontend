import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import HelpCol from './HelpCol'
import { GenreSearchHelp } from './SearchHelp'
import { helpColSize } from './SearchForm'
import './GenreSearchForm.sass'

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
  ({ data, value, onChange, fragmentService }) => {
    const options = data.map((genre) => ({
      value: genre.join(':'),
      label: genre.join(' ➝ '),
    }))
    const defaultOption = value
      ? { value: value, label: value.replaceAll(':', ' ➝ ') }
      : null

    return (
      <Form.Group as={Row} controlId="genre">
        <HelpCol overlay={GenreSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Select
            aria-label="select-genre"
            placeholder="Genre"
            options={options}
            value={defaultOption}
            onChange={(selection) => onChange(selection?.value || null)}
            isSearchable={true}
            classNamePrefix="genre-selector"
            isClearable
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </Col>
      </Form.Group>
    )
  },
  (props) => props.fragmentService.fetchGenres()
)

export default GenreSearchFormGroup
