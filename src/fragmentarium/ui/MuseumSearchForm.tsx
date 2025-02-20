import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import { Museums } from 'fragmentarium/domain/museum'
import HelpCol from './HelpCol'
import { MuseumSearchHelp } from './SearchHelp'
import { helpColSize } from './SearchForm'
import './MuseumSearchForm.sass'

interface MuseumSearchFormGroupProps {
  value: string | null
  onChange: (value: string | null) => void
}

export default function MuseumSearchFormGroup({
  value,
  onChange,
}: MuseumSearchFormGroupProps): JSX.Element {
  const options = Object.entries(Museums).map(([key, museum]) => ({
    value: key,
    label: museum.name
      ? `${museum.name}, ${museum.city}, ${museum.country}`
      : key,
  }))
  const defaultOption = value
    ? options.find((option) => option.value === value) || {
        value: value,
        label: value,
      }
    : null

  return (
    <Form.Group as={Row} controlId="museum">
      <HelpCol overlay={MuseumSearchHelp()} />
      <Col sm={12 - helpColSize}>
        <Select
          aria-label="select-museum"
          placeholder="Museum"
          options={options}
          value={defaultOption}
          onChange={(selection) => onChange(selection?.value || null)}
          isSearchable={true}
          classNamePrefix="museum-selector"
          isClearable
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
      </Col>
    </Form.Group>
  )
}
