import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  type MapUrlState,
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
  const lastWrittenSearchRef = useRef<string | null>(
    location.search.replace(/^\?/, ''),
  )

  const update = useCallback((patch: Partial<MapUrlState>) => {
    setState((current) => ({ ...current, ...patch }))
  }, [])

  useEffect(() => {
    const search = serializeMapUrlState(state)
    if (search === lastWrittenSearchRef.current) return
    lastWrittenSearchRef.current = search
    navigate({ search }, { replace: true })
  }, [state, navigate])

  useEffect(() => {
    const search = location.search.replace(/^\?/, '')
    if (search === lastWrittenSearchRef.current) return
    lastWrittenSearchRef.current = search
    setState(parseMapUrlState(search))
  }, [location.search])

  return { state, update }
}
