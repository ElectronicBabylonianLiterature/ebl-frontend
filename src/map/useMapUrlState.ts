import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  type MapUrlState,
  type MapUrlStateContext,
  parseMapUrlState,
  serializeMapUrlState,
} from './mapUrlState'

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

function isCameraOnlyChange(
  previous: MapUrlState | null,
  next: MapUrlState,
): boolean {
  return (
    previous !== null &&
    previous.selection === next.selection &&
    previous.layers === next.layers &&
    previous.overlays === next.overlays &&
    previous.siteFilter === next.siteFilter &&
    previous.visualization === next.visualization &&
    previous.tools.terrain === next.tools.terrain &&
    previous.tools.comparison === next.tools.comparison &&
    previous.tools.timeline === next.tools.timeline
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

  const lastWrittenSearchRef = useRef<string | null>(null)
  const previousStateRef = useRef<MapUrlState | null>(null)

  const writeSearch = useCallback(
    (search: string, replace: boolean) => {
      lastWrittenSearchRef.current = search
      navigate({ search }, { replace })
    },
    [navigate],
  )

  useEffect(() => {
    const search = serializeMapUrlState(state)
    if (search === lastWrittenSearchRef.current) {
      previousStateRef.current = state
      return
    }

    const replace = isCameraOnlyChange(previousStateRef.current, state)
    previousStateRef.current = state

    if (!replace) {
      writeSearch(search, false)
      return
    }

    const timeout = setTimeout(
      () => writeSearch(search, true),
      CAMERA_URL_DEBOUNCE_MS,
    )
    return () => clearTimeout(timeout)
  }, [state, writeSearch])

  useEffect(() => {
    const search = location.search.replace(/^\?/, '')
    if (
      lastWrittenSearchRef.current === null ||
      search === lastWrittenSearchRef.current
    ) {
      return
    }

    lastWrittenSearchRef.current = search
    onRestoreRef.current(parseMapUrlState(search, contextRef.current))
  }, [location.search])
}
