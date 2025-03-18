import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import HelpCol from './HelpCol'
import { ProvenanceSearchHelp } from './SearchHelp'
import { helpColSize } from './SearchForm'
import './ProvenanceSearchForm.sass'

interface ProvenanceSearchFormGroupProps {
  value: string | null
  onChange: (value: string | null) => void
  fragmentService: FragmentService
  placeholder?: string
}

const ProvenanceSearchFormGroup = withData<
  ProvenanceSearchFormGroupProps,
  { fragmentService: FragmentService },
  ReadonlyArray<ReadonlyArray<string>>
>(
  ({ data, value, onChange, fragmentService, placeholder }) => {
    const options = data.map((site) => ({
      value: site.join(' '),
      label: site.join(' '),
    }))
    const defaultOption = value ? { value: value, label: value } : null

    return (
      <Form.Group as={Row} controlId="site">
        <HelpCol overlay={ProvenanceSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Select
            aria-label="select-provenance"
            placeholder={placeholder ?? 'Provenance'}
            options={options}
            value={defaultOption}
            onChange={(selection) => onChange(selection?.value || null)}
            isSearchable={true}
            classNamePrefix="provenance-selector"
            isClearable
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </Col>
      </Form.Group>
    )
  },
  (props) => props.fragmentService.fetchProvenances()
)

export default ProvenanceSearchFormGroup
