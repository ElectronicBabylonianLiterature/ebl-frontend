import React, { useEffect, useMemo, useRef } from 'react'
import AsyncSelect from 'react-select/async'
import { useRealiaService } from 'realia/application/RealiaServiceContext'
import {
  createRealiaOptionLoader,
  RealiaLoaderContext,
  RealiaOption,
} from 'fragmentarium/ui/text-annotation/realiaOptionLoader'

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
