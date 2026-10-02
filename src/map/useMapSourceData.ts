import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { SOURCE_ID } from 'map/mapLayers'
import { provenanceToGeoJson } from 'map/provenanceToGeoJson'
import { fitMapToData } from 'map/mapBounds'

const FIT_BOUNDS_DEBOUNCE_MS = 250

export default function useMapSourceData(
  mapRef: MutableRefObject<MapLibreMap | null>,
  provenances: readonly ProvenanceRecord[] | null,
): void {
  const fitBoundsTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const map = mapRef.current
    if (!map || provenances === null) return

    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return

    const geoJson = provenanceToGeoJson(provenances)
    source.setData(geoJson)

    clearTimeout(fitBoundsTimeoutRef.current)
    fitBoundsTimeoutRef.current = setTimeout(() => {
      fitMapToData(map, geoJson.features)
    }, FIT_BOUNDS_DEBOUNCE_MS)
    return () => clearTimeout(fitBoundsTimeoutRef.current)
  }, [mapRef, provenances])
}
