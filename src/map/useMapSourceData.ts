import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { POLYGON_SOURCE_ID, SOURCE_ID } from './mapLayers'
import { provenanceToGeoJson } from './provenanceToGeoJson'
import { provenancesToPolygonGeoJson } from './provenanceToPolygonGeoJson'
import { fitMapToData } from './useFindspotMap'

export default function useMapSourceData(
  mapRef: MutableRefObject<MapLibreMap | null>,
  provenances: readonly ProvenanceRecord[] | null,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || provenances === null) return

    const pointGeoJson = provenanceToGeoJson(provenances)
    const polygonGeoJson = provenancesToPolygonGeoJson(provenances)
    const pointSource = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
    const polygonSource = map.getSource(POLYGON_SOURCE_ID) as
      | GeoJSONSource
      | undefined

    pointSource?.setData(pointGeoJson)
    polygonSource?.setData(polygonGeoJson)
    fitMapToData(map, pointGeoJson.features)
  }, [mapRef, provenances])
}
