import { useMemo } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import type { MapSelection } from './mapSelection'
import type { MapTools } from './useMapTools'
import type { MapVisualization } from './useMapVisualization'
import type { MapTerrainResult } from './useMapTerrain'
import type { ActiveOverlayEntry } from './historicalOverlayActions'
import { unionHistoricalOverlayBounds } from './historicalOverlays'
import { type BoundingBox, boundingBoxOfGeometry } from './mapGeometry'
import { type MapExtrusionMetric, dimensionMode } from './map3dState'
import { type ExtrusionScale, buildExtrusionScale } from './mapExtrusionScale'
import type { PolygonVisualizationValues } from './mapVisualizationValues'
import useMap3dTour, { type Map3dTour } from './useMap3dTour'
import type { Map3dPanelProps } from './Map3dPanel'

export interface Map3dInput {
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly tools: MapTools
  readonly visualization: MapVisualization
  readonly terrain: MapTerrainResult
  readonly excavationPolygonIndex: ExcavationPolygonIndex
  readonly provenances: readonly ProvenanceRecord[]
  readonly capabilities: readonly MapSiteCapabilities[]
  readonly selection: MapSelection | null
  readonly selectedSite: MapSiteCapabilities | undefined
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly scale: ExtrusionScale | null
}

export interface Map3d {
  readonly tour: Map3dTour
  readonly panel: Map3dPanelProps
}

/**
 * The height scale is derived before the map exists, because `useFindspotMap`
 * needs it to paint the extrusion layer on style load. It depends only on the
 * visualization values the 2D choropleth already computed.
 */
export function useExtrusionScale(
  metric: MapExtrusionMetric,
  values: PolygonVisualizationValues,
  userScale: number,
): ExtrusionScale | null {
  return useMemo(
    () => buildExtrusionScale(metric, values, userScale),
    [metric, values, userScale],
  )
}

function unionBounds(
  boxes: readonly (BoundingBox | null)[],
): BoundingBox | null {
  const usable = boxes.filter((box): box is BoundingBox => box !== null)
  if (usable.length === 0) return null

  return [
    Math.min(...usable.map((box) => box[0])),
    Math.min(...usable.map((box) => box[1])),
    Math.max(...usable.map((box) => box[2])),
    Math.max(...usable.map((box) => box[3])),
  ]
}

function polygonBoundsFor(
  index: ExcavationPolygonIndex,
  siteId: string | undefined,
): BoundingBox | null {
  return siteId === undefined
    ? null
    : unionBounds((index.get(siteId) ?? []).map((polygon) => polygon.bounds))
}

function selectedPolygonBounds(
  index: ExcavationPolygonIndex,
  selection: MapSelection | null,
): BoundingBox | null {
  if (selection?.type !== 'excavation-area') return null

  return (
    [...index.values()]
      .flat()
      .find((polygon) => polygon.polygonId === selection.polygonId)?.bounds ??
    null
  )
}

function provenanceBounds(
  provenances: readonly ProvenanceRecord[],
  selection: MapSelection | null,
): BoundingBox | null {
  if (selection?.type !== 'site') return null

  const provenance = provenances.find(
    (entry) => entry.id === selection.provenanceId,
  )
  const coordinates = provenance?.coordinates
  if (!coordinates) return null

  return boundingBoxOfGeometry({
    type: 'Point',
    coordinates: [coordinates.longitude, coordinates.latitude],
  })
}

/**
 * Assembles everything the 3D surfaces need from state the map already holds.
 * No fetch, no second map, no duplicate geometry — the extrusion scale is
 * derived from the same visualization values the 2D choropleth uses.
 */
export default function useMap3d(input: Map3dInput): Map3d {
  const { tools, visualization, terrain, scale } = input
  const { threeD } = tools

  const siteBounds = polygonBoundsFor(
    input.excavationPolygonIndex,
    input.selectedSite?.siteId,
  )
  const overlayBounds = useMemo(
    () =>
      unionHistoricalOverlayBounds(
        input.activeOverlayEntries.map((entry) => entry.overlay),
      ),
    [input.activeOverlayEntries],
  )

  const tourInput = useMemo(
    () => ({
      siteName: input.selectedSite?.siteName ?? 'Selected site',
      siteBounds:
        provenanceBounds(input.provenances, input.selection) ?? siteBounds,
      excavationBounds: siteBounds,
      selectedPolygonBounds: selectedPolygonBounds(
        input.excavationPolygonIndex,
        input.selection,
      ),
      activeOverlayBounds: overlayBounds ?? null,
      isTerrainEnabled: terrain.isEnabled,
    }),
    [
      input.selectedSite,
      input.provenances,
      input.selection,
      input.excavationPolygonIndex,
      siteBounds,
      overlayBounds,
      terrain.isEnabled,
    ],
  )

  const tour = useMap3dTour(input.mapRef, tourInput)
  const hasExtrusionData = visualization.values.size > 0

  return {
    tour,
    panel: {
      mode: dimensionMode(terrain.isEnabled, threeD.isExtrusionEnabled),
      metric: threeD.extrusionMetric,
      extrusionScale: threeD.extrusionScale,
      terrainExaggeration: threeD.terrainExaggeration,
      hillshadeVisible: threeD.hillshadeVisible,
      scale,
      terrain,
      tour,
      hasExtrusionData,
      isDensityAvailable: visualization.isDensityAvailable,
      onModeChange: tools.setDimensionMode,
      onMetricChange: tools.setExtrusionMetric,
      onExtrusionScaleChange: tools.setExtrusionScale,
      onTerrainExaggerationChange: tools.setTerrainExaggeration,
      onHillshadeChange: tools.setHillshadeVisible,
    },
  }
}
