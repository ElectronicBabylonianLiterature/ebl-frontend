import React, { Context, useCallback, useMemo, useState } from 'react'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import { RealiaInfoEntry } from 'fragmentarium/ui/text-annotation/EntityType'
import {
  buildRealiaInfoLookup,
  emptyRealiaInfoLookup,
  RealiaDisplayInfo,
  RealiaInfoLookup,
  toRealiaDisplayInfo,
} from 'fragmentarium/ui/text-annotation/realiaInfo'

export interface RealiaInfoService {
  lookup: RealiaInfoLookup
  register: (entry?: RealiaEntry) => void
}

const RealiaInfoContext: Context<RealiaInfoService> =
  React.createContext<RealiaInfoService>({
    lookup: emptyRealiaInfoLookup,
    register: () => {},
  })

function withEntry(
  current: RealiaInfoLookup,
  entry: RealiaEntry,
): RealiaInfoLookup {
  const next = new Map<string, RealiaDisplayInfo>(current)
  next.set(entry.realiaId, toRealiaDisplayInfo(entry))
  return next
}

export function useRealiaInfoService(
  entries: readonly RealiaInfoEntry[],
): RealiaInfoService {
  const inlineLookup = useMemo(() => buildRealiaInfoLookup(entries), [entries])
  const [registered, setRegistered] = useState<RealiaInfoLookup>(
    emptyRealiaInfoLookup,
  )

  const register = useCallback((entry?: RealiaEntry): void => {
    if (entry) {
      setRegistered((current) => withEntry(current, entry))
    }
  }, [])

  const lookup = useMemo(
    () => new Map<string, RealiaDisplayInfo>([...inlineLookup, ...registered]),
    [inlineLookup, registered],
  )

  return { lookup, register }
}

export default RealiaInfoContext
