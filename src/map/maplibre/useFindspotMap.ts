import { useContext, useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import ErrorReporterContext from 'ErrorReporterContext'
import { useHistory } from 'router/compat'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { resetPointerCursor } from 'map/maplibre/mapCursor'
import { initializeFindspotMap } from 'map/maplibre/mapFindspotLifecycle'
import useMapCameraOwnership, {
  type MapCameraOwnership,
} from 'map/maplibre/useMapCameraOwnership'

interface FindspotMapOptions {
  readonly onMapBackgroundErrorChange?: (hasError: boolean) => void
  readonly camera?: MapCameraOwnership
  readonly onFindspotSelect?: (id: string) => void
  readonly onExcavationSelect?: (polygonId: string) => void
  readonly isInteractionEnabled?: boolean
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  {
    onMapBackgroundErrorChange,
    camera: sharedCamera,
    onFindspotSelect,
    onExcavationSelect,
    isInteractionEnabled = true,
  }: FindspotMapOptions = {},
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const defaultCamera = useMapCameraOwnership(provenances)
  const camera = sharedCamera ?? defaultCamera
  const history = useHistory()
  const errorReporter = useContext(ErrorReporterContext)
  const latestProvenancesRef = useRef(provenances)
  latestProvenancesRef.current = provenances
  const latestInteractionEnabledRef = useRef(isInteractionEnabled)
  const interactionVersionRef = useRef(0)
  if (latestInteractionEnabledRef.current !== isInteractionEnabled) {
    interactionVersionRef.current += 1
    latestInteractionEnabledRef.current = isInteractionEnabled
  }
  const latestSelectionRef = useRef({ onFindspotSelect, onExcavationSelect })
  latestSelectionRef.current = { onFindspotSelect, onExcavationSelect }
  const latestServicesRef = useRef({ history, errorReporter })
  latestServicesRef.current = { history, errorReporter }
  const isReady = provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return
    return initializeFindspotMap(containerRef.current, mapRef, {
      camera,
      getState: () => ({
        provenances: latestProvenancesRef.current,
        isInteractionEnabled: latestInteractionEnabledRef.current,
        interactionVersion: interactionVersionRef.current,
      }),
      onFindspotSelect: (id) =>
        latestSelectionRef.current.onFindspotSelect?.(id),
      onExcavationSelect: (id) =>
        latestSelectionRef.current.onExcavationSelect?.(id),
      navigate: (path) => latestServicesRef.current.history.push(path),
      reportError: (error) =>
        latestServicesRef.current.errorReporter.captureException(error),
      onBackgroundErrorChange: onMapBackgroundErrorChange,
    })
  }, [camera, containerRef, isReady, onMapBackgroundErrorChange])

  useEffect(() => {
    if (!isInteractionEnabled && mapRef.current)
      resetPointerCursor(mapRef.current)
  }, [isInteractionEnabled])

  return mapRef
}
