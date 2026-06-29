import { useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Feature, Point } from 'geojson'
import maplibregl from 'maplibre-gl'
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
} from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { createFindspotPopup } from './createFindspotPopup'
import {
  SOURCE_ID,
  clusterCountLayer,
  clusterLayer,
  createFindspotsSource,
  unclusteredLayer,
} from './mapLayers'
import { provenanceToGeoJson } from './provenanceToGeoJson'

const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const INITIAL_CENTER: [number, number] = [44.4, 33.0]
const INITIAL_ZOOM = 5

export function fitMapToData(
  map: MapLibreMap,
  features: readonly Feature[],
): void {
  if (features.length === 0) return

  const bounds = new maplibregl.LngLatBounds()
  for (const feature of features) {
    if (feature.geometry.type === 'Point') {
      bounds.extend(feature.geometry.coordinates as [number, number])
    }
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 40, maxZoom: 12 })
  }
}

function initializeFindspotSource(
  map: MapLibreMap,
  provenances: readonly ProvenanceRecord[],
): void {
  const geoJson = provenanceToGeoJson(provenances)
  map.addSource(SOURCE_ID, createFindspotsSource(geoJson))
  map.addLayer(clusterLayer)
  map.addLayer(clusterCountLayer)
  map.addLayer(unclusteredLayer)
  fitMapToData(map, geoJson.features)
}

function expandCluster(map: MapLibreMap, cluster: MapGeoJSONFeature): void {
  const clusterId = cluster.properties?.cluster_id
  if (typeof clusterId !== 'number') return

  const source = map.getSource(SOURCE_ID) as GeoJSONSource
  void source.getClusterExpansionZoom(clusterId).then((zoom) => {
    map.easeTo({
      center: (cluster.geometry as Point).coordinates.slice() as [
        number,
        number,
      ],
      zoom,
    })
  })
}

function openFindspotPopup(map: MapLibreMap, feature: MapGeoJSONFeature): void {
  const name = feature.properties?.name
  if (typeof name !== 'string') return

  const coordinates = (feature.geometry as Point).coordinates.slice() as [
    number,
    number,
  ]
  new maplibregl.Popup()
    .setLngLat(coordinates)
    .setDOMContent(createFindspotPopup(name))
    .addTo(map)
}

function handleMapClick(map: MapLibreMap, event: MapMouseEvent): void {
  const [cluster] = map.queryRenderedFeatures(event.point, {
    layers: [clusterLayer.id],
  })
  if (cluster) {
    expandCluster(map, cluster)
    return
  }

  const [findspot] = map.queryRenderedFeatures(event.point, {
    layers: [unclusteredLayer.id],
  })
  if (findspot) {
    openFindspotPopup(map, findspot)
  }
}

function setPointerCursor(map: MapLibreMap, event: MapMouseEvent): void {
  const isOverFindspot =
    map.queryRenderedFeatures(event.point, {
      layers: [unclusteredLayer.id],
    }).length > 0
  map.getCanvas().style.cursor = isOverFindspot ? 'pointer' : ''
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const latestProvenancesRef = useRef(provenances)
  latestProvenancesRef.current = provenances
  const isReady = provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('load', () =>
      initializeFindspotSource(map, latestProvenancesRef.current ?? []),
    )
    map.on('click', (event) => handleMapClick(map, event))
    map.on('mousemove', (event) => setPointerCursor(map, event))

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [containerRef, isReady])

  return mapRef
}
