import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import { debounce } from 'lodash'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { SOURCE_ID } from 'map/maplibre/mapLayers'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
import { fitMapToData } from 'map/maplibre/mapBounds'

const FIT_BOUNDS_DEBOUNCE_MS = 250

export default function useMapSourceData(
  mapRef: MutableRefObject<MapLibreMap | null>,
  provenances: readonly ProvenanceRecord[] | null,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map || provenances === null) return

    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return

    const geoJson = provenanceToGeoJson(provenances)
    source.setData(geoJson)

    const fitToFilteredData = debounce(
      () => fitMapToData(map, geoJson.features),
      FIT_BOUNDS_DEBOUNCE_MS,
    )
    fitToFilteredData()
    return () => fitToFilteredData.cancel()
  }, [mapRef, provenances])
}
