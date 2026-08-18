import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { SOURCE_ID } from 'map/mapLayers'
import { provenanceToGeoJson } from 'map/provenanceToGeoJson'

export default function useMapSourceData(
  mapRef: MutableRefObject<MapLibreMap | null>,
  provenances: readonly ProvenanceRecord[] | null,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map || provenances === null) return

    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return

    source.setData(provenanceToGeoJson(provenances))
  }, [mapRef, provenances])
}
