import { useContext, useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import ErrorReporterContext from 'ErrorReporterContext'
import { useHistory } from 'router/compat'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { resetPointerCursor } from 'map/mapCursor'
import { initializeFindspotMap } from 'map/mapFindspotLifecycle'

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
  const interactionVersionRef = useRef(0)
  if (latestInteractionEnabledRef.current !== isInteractionEnabled) {
    interactionVersionRef.current += 1
    latestInteractionEnabledRef.current = isInteractionEnabled
  }
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
    if (!containerRef.current || !isReady) return

    return initializeFindspotMap(containerRef.current, mapRef, {
      getState: () => ({
        provenances: latestProvenancesRef.current,
        isInteractionEnabled: latestInteractionEnabledRef.current,
        interactionVersion: interactionVersionRef.current,
        cameraResetVersion: latestCameraResetVersionRef.current,
        cameraResetProvenances: cameraResetProvenancesRef.current,
      }),
      navigate: (path) => latestServicesRef.current.history.push(path),
      reportError: (error) =>
        latestServicesRef.current.errorReporter.captureException(error),
      onBackgroundErrorChange: onMapBackgroundErrorChange,
    })
  }, [containerRef, isReady, onMapBackgroundErrorChange])

  useEffect(() => {
    if (!isInteractionEnabled && mapRef.current) {
      resetPointerCursor(mapRef.current)
    }
  }, [isInteractionEnabled])

  return mapRef
}
