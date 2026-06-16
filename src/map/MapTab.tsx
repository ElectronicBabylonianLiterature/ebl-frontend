import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Alert, Form } from 'react-bootstrap'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import Spinner from 'common/ui/Spinner'
import { provenanceToGeoJson } from './provenanceToGeoJson'
import { buildFragmentSearchLink } from './mapLinks'
import {
  SOURCE_ID,
  createFindspotsSource,
  clusterLayer,
  clusterCountLayer,
  unclusteredLayer,
} from './mapLayers'
import './MapTab.sass'

const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const INITIAL_CENTER: [number, number] = [44.4, 33.0]
const INITIAL_ZOOM = 5

interface Props {
  fragmentService: FragmentService
}

function fitMapToData(
  map: maplibregl.Map,
  features: readonly GeoJSON.Feature[],
): void {
  if (features.length === 0) return
  const bounds = new maplibregl.LngLatBounds()
  for (const f of features) {
    if (f.geometry.type === 'Point') {
      bounds.extend(f.geometry.coordinates as [number, number])
    }
  }
  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 40, maxZoom: 12 })
  }
}

export default function MapTab({ fragmentService }: Props): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [provenances, setProvenances] = useState<
    readonly ProvenanceRecord[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const initializedRef = useRef(false)

  const filteredProvenances = useMemo(() => {
    if (!provenances) return null
    if (!filter.trim()) return provenances
    const lower = filter.toLowerCase()
    return provenances.filter((p) => p.longName.toLowerCase().includes(lower))
  }, [provenances, filter])

  useEffect(() => {
    fragmentService
      .fetchProvenances()
      .then(setProvenances)
      .catch((err: Error) => setError(err.message))
  }, [fragmentService])

  useEffect(() => {
    if (!mapContainer.current || !provenances || initializedRef.current) return
    initializedRef.current = true

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      const geoJson = provenanceToGeoJson(provenances)
      map.addSource(SOURCE_ID, createFindspotsSource(geoJson))
      map.addLayer(clusterLayer)
      map.addLayer(clusterCountLayer)
      map.addLayer(unclusteredLayer)
      fitMapToData(map, geoJson.features)
    })

    map.on('click', (e) => {
      const [cluster] = map.queryRenderedFeatures(e.point, {
        layers: [clusterLayer.id],
      })
      if (cluster) {
        const clusterId = cluster.properties?.cluster_id
        if (clusterId != null) {
          const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource
          source.getClusterExpansionZoom(clusterId).then((zoom) => {
            if (zoom == null) return
            map.easeTo({
              center: (
                cluster.geometry as GeoJSON.Point
              ).coordinates.slice() as [number, number],
              zoom,
            })
          })
        }
        return
      }

      const [feature] = map.queryRenderedFeatures(e.point, {
        layers: [unclusteredLayer.id],
      })
      if (feature) {
        if (!feature.properties) return
        const name = (feature.properties as Record<string, string>).name
        const coords = (
          feature.geometry as GeoJSON.Point
        ).coordinates.slice() as [number, number]
        const link = buildFragmentSearchLink(name)
        new maplibregl.Popup()
          .setLngLat(coords)
          .setHTML(
            `<strong>${name}</strong><br><a href="${link}">View fragments</a>`,
          )
          .addTo(map)
      }
    })

    map.on('mousemove', (e) => {
      map.getCanvas().style.cursor =
        map.queryRenderedFeatures(e.point, {
          layers: [unclusteredLayer.id],
        }).length > 0
          ? 'pointer'
          : ''
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [provenances])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !filteredProvenances) return
    if (!map.getSource(SOURCE_ID)) return
    const geoJson = provenanceToGeoJson(filteredProvenances)
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource
    source.setData(geoJson)
    fitMapToData(map, geoJson.features)
  }, [filteredProvenances])

  if (error) {
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  }

  if (!provenances) {
    return <Spinner>Loading map data...</Spinner>
  }

  return (
    <div className="map-tab">
      <Form.Group className="map-tab__search mb-3">
        <Form.Control
          type="text"
          placeholder="Filter by site name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter findspots by name"
        />
      </Form.Group>
      {filteredProvenances && filteredProvenances.length === 0 ? (
        <Alert variant="info">No findspots match &ldquo;{filter}&rdquo;.</Alert>
      ) : null}
      <div
        ref={mapContainer}
        className="map-tab__container"
        aria-label="Findspot map"
      />
    </div>
  )
}
