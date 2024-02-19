import React from 'react'
import withData from 'http/withData'
import Select from 'react-select'
import FragmentService from 'fragmentarium/application/FragmentService'
import './ArchaeologySearchForm.sass'

export default withData<
  {
    onChange: (value: string | null) => void
    value?: string | null
  },
  { fragmentService: FragmentService },
  ReadonlyArray<ReadonlyArray<string>>
>(
  ({ data, value, onChange }) => {
    const options = data.map((archaeology) => ({
      value: archaeology[0],
      label: archaeology[0],
    }))
    const defaultOption = value ? { value: value, label: value } : null

    return (
      <Select
        aria-label="select-archaeology"
        placeholder="Provenance"
        options={options}
        value={defaultOption}
        onChange={(selection) => {
          onChange(selection?.value || null)
        }}
        isSearchable={true}
        classNamePrefix={'archaeology-selector'}
        isClearable
      />
    )
  },
  (props) => props.fragmentService.fetchArchaeologies()
)
