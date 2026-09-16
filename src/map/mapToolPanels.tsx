import React, { useMemo } from 'react'
import type { HistoricalMapOverlay } from './historicalOverlays'
import type { PolygonFindspotSummary } from './findspotMapData'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import type { MapVisualizationMode } from './mapChoroplethScale'
import type { MapTools } from './useMapTools'
import type { MapTerrainResult } from './useMapTerrain'
import type { MapToolInteractions } from './useMapToolInteractions'
import { toDatedOverlays } from './overlayPublicationDates'
import { toExportRows } from './mapExportData'
import { assessImageExport } from './mapImageExportRights'
import MapComparePanel from './MapComparePanel'
import MapExportPanel from './MapExportPanel'
import MapMeasurePanel from './MapMeasurePanel'
import MapSpatialSearchPanel from './MapSpatialSearchPanel'
import MapTerrainPanel from './MapTerrainPanel'
import MapTimelinePanel from './MapTimelinePanel'
import Map3dPanel, { type Map3dPanelProps } from './Map3dPanel'
import type { MapElevationProfile } from './useMapElevationProfile'
import type { MapPanelDefinition } from './MapToolbar'

export interface ToolPanelsInput {
  readonly tools: MapTools
  readonly terrain: MapTerrainResult
  readonly overlays: readonly HistoricalMapOverlay[]
  readonly activeOverlays: readonly HistoricalMapOverlay[]
  readonly excavationPolygonIndex: ExcavationPolygonIndex
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
  readonly visualization: MapVisualizationMode
  readonly siteFilter: string
  readonly interactions: MapToolInteractions
  readonly elevation: MapElevationProfile
  readonly threeD: Map3dPanelProps
}

/**
 * Compare, timeline, spatial search, measure, export and terrain — the six
 * feature panels that were previously assembled by `MapAdvancedTools`. Split
 * out from `mapInfoPanels` (inspector/layers/visualization) purely to keep
 * each file within the project's line limit.
 */
export function useToolPanelDefinitions({
  tools,
  terrain,
  overlays,
  activeOverlays,
  excavationPolygonIndex,
  polygonSummaries,
  visualization,
  siteFilter,
  interactions,
  elevation,
  threeD,
}: ToolPanelsInput): readonly MapPanelDefinition[] {
  const dated = useMemo(() => toDatedOverlays(overlays), [overlays])
  const exportRows = useMemo(
    () =>
      toExportRows(
        [...excavationPolygonIndex.values()].flat(),
        polygonSummaries,
      ),
    [excavationPolygonIndex, polygonSummaries],
  )
  const imageExport = useMemo(
    () => assessImageExport({ activeOverlays, preservesDrawingBuffer: false }),
    [activeOverlays],
  )

  return useMemo(
    () => [
      {
        id: 'comparison' as const,
        label: 'Compare',
        isSupported: overlays.length > 0,
        render: () => (
          <MapComparePanel
            overlays={overlays}
            comparison={tools.comparison}
            onModeChange={tools.setComparisonMode}
            onSideChange={tools.setComparisonSide}
            onPositionChange={tools.setBlendPosition}
            onToggleSolo={tools.toggleSolo}
          />
        ),
      },
      {
        id: 'timeline' as const,
        label: 'Timeline',
        isSupported: overlays.length > 0,
        render: () => (
          <MapTimelinePanel
            dated={dated}
            timeline={tools.timeline}
            onChange={tools.setTimeline}
          />
        ),
      },
      {
        id: 'spatial-search' as const,
        label: 'Search area',
        isSupported: excavationPolygonIndex.size > 0,
        render: () => (
          <MapSpatialSearchPanel
            shape={interactions.searchShape}
            result={interactions.searchResult}
            isDrawing={interactions.isDrawing}
            onSearchViewport={interactions.searchViewport}
            onStartDrawing={interactions.startDrawing}
            onClear={interactions.clearSearch}
          />
        ),
      },
      {
        id: 'measurement' as const,
        label: 'Measure',
        isSupported: true,
        render: () => (
          <MapMeasurePanel
            mode={interactions.measurementMode}
            units={interactions.measurementUnits}
            positions={interactions.measurementPositions}
            onModeChange={interactions.setMeasurementMode}
            onUnitsChange={interactions.setMeasurementUnits}
            onClear={interactions.clearMeasurement}
            elevation={elevation}
          />
        ),
      },
      {
        id: 'export' as const,
        label: 'Export',
        isSupported: true,
        render: () => (
          <MapExportPanel
            rows={exportRows}
            imageExport={imageExport}
            buildContext={() => ({
              visualization,
              siteFilter,
              shareUrl: window.location.href,
              exportedAt: new Date().toISOString(),
            })}
          />
        ),
      },
      {
        id: 'three-d' as const,
        label: '3D',
        isSupported: terrain.isSupported || threeD.hasExtrusionData,
        render: () => <Map3dPanel {...threeD} />,
      },
      {
        id: 'terrain' as const,
        label: 'Terrain',
        isSupported: terrain.isSupported || terrain.source !== null,
        render: () => (
          <MapTerrainPanel
            terrain={terrain}
            isRequested={tools.terrain}
            onChange={tools.setTerrain}
          />
        ),
      },
    ],
    [
      tools,
      terrain,
      overlays,
      excavationPolygonIndex,
      dated,
      exportRows,
      imageExport,
      visualization,
      siteFilter,
      interactions,
      elevation,
      threeD,
    ],
  )
}
