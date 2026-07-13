import React, { Context, useCallback, useEffect, useRef, useState } from 'react'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import { useRealiaService } from 'realia/application/RealiaServiceContext'
import {
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

function withEntries(
  current: RealiaInfoLookup,
  entries: readonly RealiaEntry[],
): RealiaInfoLookup {
  const next = new Map<string, RealiaDisplayInfo>(current)
  entries.forEach((entry) =>
    next.set(entry.realiaId, toRealiaDisplayInfo(entry)),
  )
  return next
}

export function useRealiaInfoService(
  realiaIds: readonly string[],
): RealiaInfoService {
  const realiaService = useRealiaService()
  const [lookup, setLookup] = useState<RealiaInfoLookup>(emptyRealiaInfoLookup)
  const requestedIds = useRef(new Set<string>())

  const register = useCallback((entry?: RealiaEntry): void => {
    if (!entry) {
      return
    }
    requestedIds.current.add(entry.realiaId)
    setLookup((current) => withEntries(current, [entry]))
  }, [])

  useEffect(() => {
    const missingIds = realiaIds.filter((id) => !requestedIds.current.has(id))
    if (missingIds.length === 0) {
      return
    }
    missingIds.forEach((id) => requestedIds.current.add(id))

    let isCancelled = false
    Promise.all(
      missingIds.map((id) =>
        Promise.resolve(realiaService.find(id)).catch(() => null),
      ),
    ).then((entries) => {
      const found = entries.filter((entry): entry is RealiaEntry => !!entry)
      if (!isCancelled && found.length > 0) {
        setLookup((current) => withEntries(current, found))
      }
    })

    return () => {
      isCancelled = true
    }
  }, [realiaIds, realiaService])

  return { lookup, register }
}

export default RealiaInfoContext
