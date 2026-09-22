import React, { useEffect, useMemo, useRef, useState } from 'react'
import Select from 'react-select'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { matchesFindspot } from 'map/findspotFilter'
import { normalizeMapFilter } from 'map/mapUrlState'

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
  const [inputValue, setInputValue] = useState(filter)
  const internallyRequestedFilterRef = useRef<string | null>(null)

  useEffect(() => {
    if (internallyRequestedFilterRef.current === filter) {
      internallyRequestedFilterRef.current = null
      return
    }
    internallyRequestedFilterRef.current = null
    setInputValue(filter)
  }, [filter])

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
          const nextFilter = normalizeMapFilter(nextInput)
          if (nextFilter !== filter) {
            internallyRequestedFilterRef.current = nextFilter
          }
          setInputValue(nextFilter)
          onFilterChange(nextFilter)
        }
      }}
      onChange={(option) => {
        const nextFilter = option ? option.value : ''
        if (nextFilter !== filter) {
          internallyRequestedFilterRef.current = nextFilter
        }
        setInputValue('')
        onFilterChange(nextFilter)
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
