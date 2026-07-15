import React, { useEffect, useMemo, useRef } from 'react'
import { debounce } from 'lodash'
import AsyncSelect from 'react-select/async'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaService from 'realia/application/RealiaService'
import { useRealiaService } from 'realia/application/RealiaServiceContext'

export const SEARCH_DEBOUNCE_MS = 300

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

export interface RealiaLoaderContext {
  realiaService: RealiaService
  excludedRealiaIds: readonly string[]
}

type OptionsCallback = (options: RealiaOption[]) => void

export interface RealiaOptionLoader {
  (query: string, callback: OptionsCallback): void
  cancel: () => void
}

export function createRealiaOptionLoader(
  getContext: () => RealiaLoaderContext,
  wait: number = SEARCH_DEBOUNCE_MS,
): RealiaOptionLoader {
  const search = debounce((query: string, callback: OptionsCallback): void => {
    const { realiaService, excludedRealiaIds } = getContext()
    loadRealiaOptions(realiaService, query, excludedRealiaIds).then(callback)
  }, wait)

  const load = (query: string, callback: OptionsCallback): void => {
    if (query) {
      search(query, callback)
    } else {
      search.cancel()
      callback([])
    }
  }
  load.cancel = (): void => search.cancel()
  return load
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
  const contextRef = useRef<RealiaLoaderContext>({
    realiaService,
    excludedRealiaIds,
  })
  contextRef.current = { realiaService, excludedRealiaIds }

  const loadOptions = useMemo(
    () => createRealiaOptionLoader(() => contextRef.current),
    [],
  )
  useEffect(() => loadOptions.cancel, [loadOptions])

  return (
    <AsyncSelect
      aria-label={ariaLabel}
      placeholder={'Search realia'}
      isClearable
      loadOptions={loadOptions}
      value={value}
      onChange={(option) => onChange(option as RealiaOption | null)}
    />
  )
}
