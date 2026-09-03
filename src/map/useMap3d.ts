import { useCallback, useMemo } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  getRenderableProvenanceGeometry as getProvenanceShape,
} from 'fragmentarium/domain/Provenance'
import {
  type BoundingBox,
  boundingBoxOfGeometry,
  centroidOf,
  unionBoundingBoxes,
} from 'map/mapGeometry'
import {
  type Map3dState,
  type MapDimensionMode,
  type MapExtrusionMetric,
  clampExtrusionScale,
  clampTerrainExaggeration,
  dimensionMode,
} from 'map/map3dState'
import { buildExtrusionScale } from 'map/mapExtrusionScale'
import type { MapVisualization } from 'map/useMapVisualization'
import type { MapTerrainResult } from 'map/useMapTerrain'
import useMap3dTour, { type Map3dTour } from 'map/useMap3dTour'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import type { Map3dPanelProps } from 'map/Map3dPanel'

export interface Map3dInput {
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly state: Map3dState
  readonly setState: (state: Map3dState) => void
  readonly visualization: MapVisualization
  readonly terrain: MapTerrainResult
  readonly siteName: string
  readonly provenances: readonly ProvenanceRecord[]
  readonly excavationPolygons: readonly ExcavationPolygon[]
  readonly selectedPolygon: ExcavationPolygon | null
}

export interface Map3d {
  readonly tour: Map3dTour
  readonly panel: Map3dPanelProps
}

function provenanceBounds(
  provenances: readonly ProvenanceRecord[],
): BoundingBox | null {
  const points = provenances.flatMap((provenance) => {
    const shape = getProvenanceShape(provenance)
    if (!shape) return []
    const point =
      shape.type === 'point'
        ? shape.coordinates
        : centroidOf(shape.coordinates)
    return point ? [[point.longitude, point.latitude] as const] : []
  })
  return points.length === 0
    ? null
    : points.reduce<BoundingBox>(
        ([w, s, e, n], [lng, lat]) => [
          Math.min(w, lng),
          Math.min(s, lat),
          Math.max(e, lng),
          Math.max(n, lat),
        ],
        [points[0][0], points[0][1], points[0][0], points[0][1]],
      )
}

export default function useMap3d({
  mapRef,
  state,
  setState,
  visualization,
  terrain,
  siteName,
  provenances,
  excavationPolygons,
  selectedPolygon,
}: Map3dInput): Map3d {
  const scale = useMemo(
    () =>
      buildExtrusionScale(
        state.extrusionMetric,
        visualization.values,
        state.extrusionScale,
      ),
    [state.extrusionMetric, visualization.values, state.extrusionScale],
  )

  const tourInput = useMemo(
    () => ({
      siteName,
      siteBounds: provenanceBounds(provenances),
      excavationBounds: unionBoundingBoxes(
        excavationPolygons.map((polygon) => polygon.bounds),
      ),
      selectedPolygonBounds: selectedPolygon
        ? boundingBoxOfGeometry(selectedPolygon.geometry)
        : null,
      activeOverlayBounds: null,
      isTerrainEnabled: terrain.isEnabled,
    }),
    [siteName, provenances, excavationPolygons, selectedPolygon, terrain.isEnabled],
  )

  const tour = useMap3dTour(mapRef, tourInput)

  const patch = useCallback(
    (next: Partial<Map3dState>) => setState({ ...state, ...next }),
    [state, setState],
  )

  const onModeChange = useCallback(
    (mode: MapDimensionMode) =>
      patch({ isExtrusionEnabled: mode === 'extrusion' }),
    [patch],
  )

  return {
    tour,
    panel: {
      mode: dimensionMode(terrain.isEnabled, state.isExtrusionEnabled),
      metric: state.extrusionMetric,
      extrusionScale: state.extrusionScale,
      terrainExaggeration: state.terrainExaggeration,
      hillshadeVisible: state.hillshadeVisible,
      scale,
      terrain,
      tour,
      hasExtrusionData: visualization.values.size > 0,
      isDensityAvailable: visualization.isDensityAvailable,
      onModeChange,
      onMetricChange: (metric: MapExtrusionMetric) =>
        patch({ extrusionMetric: metric }),
      onExtrusionScaleChange: (value: number) =>
        patch({ extrusionScale: clampExtrusionScale(value) }),
      onTerrainExaggerationChange: (value: number) =>
        patch({ terrainExaggeration: clampTerrainExaggeration(value) }),
      onHillshadeChange: (isVisible: boolean) =>
        patch({ hillshadeVisible: isVisible }),
    },
  }
}
