import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  type MapUrlState,
  mergeMapUrlStateIntoSearch,
  normalizeMapUrlState,
  parseMapUrlState,
} from 'map/mapUrlState'

export interface MapUrlStateController {
  readonly state: MapUrlState
  readonly update: (patch: Partial<MapUrlState>) => void
}

export default function useMapUrlState(): MapUrlStateController {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState<MapUrlState>(() =>
    parseMapUrlState(location.search),
  )
  const latestLocationRef = useRef(location)
  latestLocationRef.current = location
  const latestStateRef = useRef(state)
  latestStateRef.current = state
  const lastWrittenSearchRef = useRef<string | null>(null)

  const update = useCallback(
    (patch: Partial<MapUrlState>) => {
      const next = normalizeMapUrlState({ ...latestStateRef.current, ...patch })
      if (
        next.version === latestStateRef.current.version &&
        next.filter === latestStateRef.current.filter &&
        next.showExcavationAreas === latestStateRef.current.showExcavationAreas
      ) {
        return
      }
      latestStateRef.current = next
      setState(next)
      const currentLocation = latestLocationRef.current
      const search = mergeMapUrlStateIntoSearch(currentLocation.search, next)
      if (search === currentLocation.search.replace(/^\?/, '')) return
      lastWrittenSearchRef.current = search
      navigate(
        {
          pathname: currentLocation.pathname,
          search,
          hash: currentLocation.hash,
        },
        { replace: true, state: currentLocation.state },
      )
    },
    [navigate],
  )

  useEffect(() => {
    const search = location.search.replace(/^\?/, '')
    if (search === lastWrittenSearchRef.current) {
      lastWrittenSearchRef.current = null
      return
    }
    lastWrittenSearchRef.current = null
    const next = parseMapUrlState(search)
    latestStateRef.current = next
    setState(next)
  }, [location.search])

  return { state, update }
}
