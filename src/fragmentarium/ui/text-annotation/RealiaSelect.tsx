import React from 'react'
import AsyncSelect from 'react-select/async'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaService from 'realia/application/RealiaService'
import { useRealiaService } from 'realia/application/RealiaServiceContext'

export interface RealiaOption {
  label: string
  value: string
  entry?: RealiaEntry
}

export function toRealiaOption(entry: RealiaEntry): RealiaOption {
  return { value: entry.realiaId, label: entry.id, entry }
}

export function loadRealiaOptions(
  realiaService: RealiaService,
  query: string,
  excludedRealiaIds: readonly string[] = [],
): Promise<RealiaOption[]> {
  return query
    ? Promise.resolve(realiaService.search(query)).then((entries) =>
        entries
          .filter((entry) => !excludedRealiaIds.includes(entry.realiaId))
          .map(toRealiaOption),
      )
    : Promise.resolve([])
}

interface RealiaSelectProps {
  ariaLabel: string
  value: RealiaOption | null
  onChange: (option: RealiaOption | null) => void
  excludedRealiaIds?: readonly string[]
}

export default function RealiaSelect({
  ariaLabel,
  value,
  onChange,
  excludedRealiaIds = [],
}: RealiaSelectProps): JSX.Element {
  const realiaService = useRealiaService()

  return (
    <AsyncSelect
      aria-label={ariaLabel}
      placeholder={'Search realia'}
      isClearable
      loadOptions={(query: string) =>
        loadRealiaOptions(realiaService, query, excludedRealiaIds)
      }
      value={value}
      onChange={(option) => onChange(option as RealiaOption | null)}
    />
  )
}
