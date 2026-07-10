import React from 'react'
import AsyncSelect from 'react-select/async'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaService from 'realia/application/RealiaService'
import { useRealiaService } from 'realia/application/RealiaServiceContext'

export interface RealiaOption {
  label: string
  value: string
}

export function toRealiaOption(entry: RealiaEntry): RealiaOption {
  return { value: entry.realiaId, label: entry.id }
}

export function loadRealiaOptions(
  realiaService: RealiaService,
  query: string,
): Promise<RealiaOption[]> {
  return query
    ? Promise.resolve(realiaService.search(query)).then((entries) =>
        entries.map(toRealiaOption),
      )
    : Promise.resolve([])
}

interface RealiaSelectProps {
  ariaLabel: string
  value: RealiaOption | null
  onChange: (option: RealiaOption | null) => void
}

export default function RealiaSelect({
  ariaLabel,
  value,
  onChange,
}: RealiaSelectProps): JSX.Element {
  const realiaService = useRealiaService()

  return (
    <AsyncSelect
      aria-label={ariaLabel}
      placeholder={'Search realia…'}
      cacheOptions
      isClearable
      loadOptions={(query: string) => loadRealiaOptions(realiaService, query)}
      value={value}
      onChange={(option) => onChange(option as RealiaOption | null)}
    />
  )
}
