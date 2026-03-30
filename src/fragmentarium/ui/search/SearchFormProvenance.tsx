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
    const sorted = [...data].sort((first, second) => {
      const firstIsRoot = !first.parent
      const secondIsRoot = !second.parent
      if (firstIsRoot !== secondIsRoot) return firstIsRoot ? -1 : 1
      if (firstIsRoot && secondIsRoot)
        return (
          first.sortKey - second.sortKey ||
          first.longName.localeCompare(second.longName)
        )
      return first.longName.localeCompare(second.longName)
    })

    const options = sorted.map((site) => ({
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
