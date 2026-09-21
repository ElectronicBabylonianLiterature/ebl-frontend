import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  type MapUrlState,
  normalizeMapUrlState,
  parseMapUrlState,
  serializeMapUrlState,
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
  const lastWrittenSearchRef = useRef<string | null>(
    location.search.replace(/^\?/, ''),
  )

  const update = useCallback((patch: Partial<MapUrlState>) => {
    setState((current) => normalizeMapUrlState({ ...current, ...patch }))
  }, [])

  useEffect(() => {
    const search = serializeMapUrlState(state)
    if (search === lastWrittenSearchRef.current) return
    lastWrittenSearchRef.current = search
    const currentLocation = latestLocationRef.current
    navigate(
      {
        pathname: currentLocation.pathname,
        search,
        hash: currentLocation.hash,
      },
      { replace: true, state: currentLocation.state },
    )
  }, [state, navigate])

  useEffect(() => {
    const search = location.search.replace(/^\?/, '')
    if (search === lastWrittenSearchRef.current) return
    lastWrittenSearchRef.current = search
    setState(parseMapUrlState(search))
  }, [location.search])

  return { state, update }
}
