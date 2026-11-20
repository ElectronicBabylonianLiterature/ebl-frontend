import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { SOURCE_ID } from 'map/maplibre/mapLayers'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
import { fitMapToData } from 'map/maplibre/mapBounds'
import useMapCameraOwnership, {
  type MapCameraOwnership,
} from 'map/maplibre/useMapCameraOwnership'

const FIT_BOUNDS_DEBOUNCE_MS = 250

export default function useMapSourceData(
  mapRef: MutableRefObject<MapLibreMap | null>,
  provenances: readonly ProvenanceRecord[] | null,
  sharedCamera?: MapCameraOwnership,
): void {
  const fitBoundsTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const defaultCamera = useMapCameraOwnership(provenances)
  const camera = sharedCamera ?? defaultCamera

  useEffect(() => {
    const map = mapRef.current
    if (!map || provenances === null) return

    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return

    const geoJson = provenanceToGeoJson(provenances)
    source.setData(geoJson)

    clearTimeout(fitBoundsTimeoutRef.current)
    if (!camera.shouldFitData()) return

    const isCurrent = camera.capture()
    fitBoundsTimeoutRef.current = setTimeout(() => {
      if (isCurrent()) fitMapToData(map, geoJson.features)
    }, FIT_BOUNDS_DEBOUNCE_MS)
    return () => clearTimeout(fitBoundsTimeoutRef.current)
  }, [camera, mapRef, provenances])
}
