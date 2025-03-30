import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import { HelpCol } from 'fragmentarium/ui/SearchHelp'
import { helpColSize } from 'fragmentarium/ui/SearchForm'

interface SelectFormGroupProps {
  controlId: string
  helpOverlay: JSX.Element
  placeholder: string
  options: Array<{ value: string; label: string }>
  value: string | null
  onChange: (value: string | null) => void
  classNamePrefix: string
}

export default function SelectFormGroup({
  controlId,
  helpOverlay,
  placeholder,
  options,
  value,
  onChange,
  classNamePrefix,
}: SelectFormGroupProps): JSX.Element {
  const defaultOption = value
    ? options.find((option) => option.value === value) || {
        value: value,
        label: value,
      }
    : null

  return (
    <Form.Group as={Row} controlId={controlId}>
      <HelpCol overlay={helpOverlay} />
      <Col sm={12 - helpColSize}>
        <Select
          aria-label={`select-${controlId}`}
          placeholder={placeholder}
          options={options}
          value={defaultOption}
          onChange={(selection) => onChange(selection?.value || null)}
          isSearchable={true}
          classNamePrefix={classNamePrefix}
          isClearable
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        />
      </Col>
    </Form.Group>
  )
}
