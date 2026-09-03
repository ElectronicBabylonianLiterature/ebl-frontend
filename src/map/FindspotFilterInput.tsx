import React, { useMemo, useState } from 'react'
import Select from 'react-select'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { matchesFindspot } from 'map/findspotFilter'

interface Props {
  provenances: readonly ProvenanceRecord[]
  filter: string
  onFilterChange: (filter: string) => void
}

interface FindspotOption {
  value: string
  label: string
}

export default function FindspotFilterInput({
  provenances,
  filter,
  onFilterChange,
}: Props): JSX.Element {
  const [inputValue, setInputValue] = useState('')

  const options = useMemo<FindspotOption[]>(
    () =>
      provenances.map((provenance) => ({
        value: provenance.longName,
        label: provenance.longName,
      })),
    [provenances],
  )

  const selectedOption = useMemo(
    () => options.find((option) => option.value === filter) ?? null,
    [options, filter],
  )
  const value =
    selectedOption ?? (filter ? { value: filter, label: filter } : null)

  return (
    <Select<FindspotOption>
      value={value}
      controlShouldRenderValue={selectedOption !== null}
      inputValue={inputValue}
      onInputChange={(nextInput, meta) => {
        if (meta.action === 'input-change') {
          setInputValue(nextInput)
          onFilterChange(nextInput)
        }
      }}
      onChange={(option) => {
        setInputValue('')
        onFilterChange(option ? option.value : '')
      }}
      options={options}
      filterOption={(option, rawInput) =>
        matchesFindspot(option.label, rawInput)
      }
      placeholder="Filter by site name..."
      aria-label="Filter findspots by name"
      classNamePrefix="findspot-filter"
      isClearable
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      noOptionsMessage={() => 'No site names match your filter.'}
    />
  )
}
