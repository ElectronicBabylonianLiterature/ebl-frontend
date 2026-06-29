import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { SOURCE_ID } from './mapLayers'
import { provenanceToGeoJson } from './provenanceToGeoJson'
import { fitMapToData } from './useFindspotMap'

export default function useMapSourceData(
  mapRef: MutableRefObject<MapLibreMap | null>,
  provenances: readonly ProvenanceRecord[] | null,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || provenances === null) return

    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return

    const geoJson = provenanceToGeoJson(provenances)
    source.setData(geoJson)
    fitMapToData(map, geoJson.features)
  }, [mapRef, provenances])
}
