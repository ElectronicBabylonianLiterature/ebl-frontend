import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DEFAULT_MAP_URL_STATE,
  type MapUrlState,
  type MapUrlStateContext,
  parseMapUrlState,
  serializeMapUrlState,
} from 'map/mapUrlState'

export const CAMERA_URL_DEBOUNCE_MS = 400

export function useInitialMapUrlState(
  context: MapUrlStateContext,
): MapUrlState {
  const location = useLocation()
  const initialStateRef = useRef<MapUrlState | null>(null)

  if (initialStateRef.current === null) {
    initialStateRef.current = parseMapUrlState(location.search, context)
  }

  return initialStateRef.current
}

function isReplaceableChange(
  previous: MapUrlState | null,
  next: MapUrlState,
): boolean {
  if (previous === null) return false
  return (
    serializeMapUrlState({
      ...previous,
      camera: DEFAULT_MAP_URL_STATE.camera,
      siteFilter: '',
    }) ===
    serializeMapUrlState({
      ...next,
      camera: DEFAULT_MAP_URL_STATE.camera,
      siteFilter: '',
    })
  )
}

export default function useMapUrlSync(
  state: MapUrlState,
  context: MapUrlStateContext,
  onRestore: (restored: MapUrlState) => void,
): void {
  const location = useLocation()
  const navigate = useNavigate()
  const contextRef = useRef(context)
  contextRef.current = context
  const onRestoreRef = useRef(onRestore)
  onRestoreRef.current = onRestore

  const lastWrittenSearchRef = useRef(location.search.replace(/^\?/, ''))
  const previousStateRef = useRef<MapUrlState | null>(null)
  const lastObservedSearchRef = useRef(location.search.replace(/^\?/, ''))

  const writeSearch = useCallback(
    (search: string, replace: boolean) => {
      lastWrittenSearchRef.current = search
      navigate({ search }, { replace })
    },
    [navigate],
  )

  useEffect(() => {
    if (location.search.replace(/^\?/, '') !== lastWrittenSearchRef.current)
      return
    const search = serializeMapUrlState(state)
    if (search === lastWrittenSearchRef.current) {
      previousStateRef.current = state
      return
    }

    const initial = previousStateRef.current === null
    const replace = isReplaceableChange(previousStateRef.current, state)
    previousStateRef.current = state

    if (!replace) {
      writeSearch(search, initial)
      return
    }

    const timeout = setTimeout(
      () => writeSearch(search, true),
      CAMERA_URL_DEBOUNCE_MS,
    )
    return () => clearTimeout(timeout)
  }, [state, writeSearch, location.search])

  useEffect(() => {
    const search = location.search.replace(/^\?/, '')
    if (search === lastObservedSearchRef.current) return
    lastObservedSearchRef.current = search
    if (search === lastWrittenSearchRef.current) {
      return
    }

    lastWrittenSearchRef.current = search
    previousStateRef.current = null
    onRestoreRef.current(parseMapUrlState(search, contextRef.current))
  }, [location.search])
}
