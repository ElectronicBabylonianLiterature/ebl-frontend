import React from 'react'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceSearchHelp } from 'fragmentarium/ui/SearchHelp'
import SelectFormGroup from './SelectFromGroup'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

interface ProvenanceSearchFormGroupProps {
  value: string | null
  onChange: (value: string | null) => void
  fragmentService: FragmentService
  placeholder?: string
}

const ProvenanceSearchFormGroup = withData<
  ProvenanceSearchFormGroupProps,
  { fragmentService: FragmentService },
  readonly ProvenanceRecord[]
>(
  ({ data, value, onChange, placeholder }) => {
    const options = data.map((site) => ({
      value: site.longName,
      label: site.longName,
    }))

    return (
      <SelectFormGroup
        controlId="site"
        helpOverlay={ProvenanceSearchHelp()}
        placeholder={placeholder ?? 'Provenance'}
        options={options}
        value={value}
        onChange={onChange}
        classNamePrefix="provenance-selector"
      />
    )
  },
  (props) => props.fragmentService.fetchProvenances(),
)

export default ProvenanceSearchFormGroup
