import { useContext, useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import maplibregl from 'maplibre-gl'
import ErrorReporterContext from 'ErrorReporterContext'
import { useHistory } from 'router/compat'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { resetPointerCursor } from 'map/mapCursor'
import {
  bindFindspotMapEvents,
  createFindspotMap,
  initializeFindspotSource,
  type FindspotMapHandlers,
} from 'map/findspotMapLifecycle'

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  onMapBackgroundErrorChange?: (hasError: boolean) => void,
  cameraResetVersion = 0,
  isInteractionEnabled = true,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const history = useHistory()
  const errorReporter = useContext(ErrorReporterContext)
  const latestProvenancesRef = useRef(provenances)
  latestProvenancesRef.current = provenances
  const latestInteractionEnabledRef = useRef(isInteractionEnabled)
  latestInteractionEnabledRef.current = isInteractionEnabled
  const latestCameraResetVersionRef = useRef(cameraResetVersion)
  const previousCameraResetVersionRef = useRef(cameraResetVersion)
  const cameraResetProvenancesRef = useRef(provenances)
  latestCameraResetVersionRef.current = cameraResetVersion
  if (previousCameraResetVersionRef.current !== cameraResetVersion) {
    previousCameraResetVersionRef.current = cameraResetVersion
    cameraResetProvenancesRef.current = provenances
  }
  const latestServicesRef = useRef({ history, errorReporter })
  latestServicesRef.current = { history, errorReporter }
  const isReady = provenances !== null

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isReady) return

    const cameraResetVersionAtCreation = latestCameraResetVersionRef.current
    const map = createFindspotMap(
      container,
      (error) =>
        latestServicesRef.current.errorReporter.captureException(error),
      onMapBackgroundErrorChange,
    )
    if (!map) return

    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    let isActive = true
    const handlers: FindspotMapHandlers = {
      isActive: () => isActive && latestInteractionEnabledRef.current,
      navigate: (path) => latestServicesRef.current.history.push(path),
      reportError: (error) =>
        latestServicesRef.current.errorReporter.captureException(error),
    }
    const handleLoad = () => {
      onMapBackgroundErrorChange?.(false)
      const loadedProvenances = latestProvenancesRef.current
      if (loadedProvenances) {
        const resetStillOwnsLatestData =
          latestCameraResetVersionRef.current !==
            cameraResetVersionAtCreation &&
          loadedProvenances === cameraResetProvenancesRef.current
        initializeFindspotSource(
          map,
          loadedProvenances,
          !resetStillOwnsLatestData,
        )
      }
    }
    const unbindEvents = bindFindspotMapEvents(
      map,
      handlers,
      handleLoad,
      onMapBackgroundErrorChange,
    )

    return () => {
      isActive = false
      unbindEvents()
      map.remove()
      mapRef.current = null
    }
  }, [containerRef, isReady, onMapBackgroundErrorChange])

  useEffect(() => {
    if (!isInteractionEnabled && mapRef.current) {
      resetPointerCursor(mapRef.current)
    }
  }, [isInteractionEnabled])

  return mapRef
}
