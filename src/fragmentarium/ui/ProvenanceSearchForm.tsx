import React from 'react'
import withData from 'http/withData'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import './ProvenanceSearchForm.sass'

export default withData<
  {
    onChange: (value: string | null) => void
    value?: string | null
  },
  { fragmentService: FragmentService },
  ReadonlyArray<ReadonlyArray<string>>
>(
  ({ data, value, onChange }) => {
    const options = data.map((site) => ({
      value: site.join(' '),
      label: site.join(' '),
    }))
    const defaultOption = value ? { value: value, label: value } : null

    return (
      <Select
        aria-label="select-provenance"
        placeholder="Provenance"
        options={options}
        value={defaultOption}
        onChange={(selection) => {
          onChange(selection?.value || null)
        }}
        isSearchable={true}
        classNamePrefix={'provenance-selector'}
        isClearable
      />
    )
  },
  (props) => props.fragmentService.fetchProvenances()
)
