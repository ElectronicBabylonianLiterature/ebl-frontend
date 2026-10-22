import React, { useMemo, type MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useMapExportPolygons from 'map/useMapExportPolygons'
import type { HistoricalMapOverlay } from 'map/historicalOverlays'
import type {
  FindspotMapDataStatus,
  PolygonFindspotSummary,
} from 'map/findspotMapData'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { MapVisualizationMode } from 'map/mapChoroplethScale'
import type { MapTools } from 'map/useMapTools'
import type { MapTerrainResult } from 'map/useMapTerrain'
import type { MapToolInteractions } from 'map/useMapToolInteractions'
import { toDatedOverlays } from 'map/overlayPublicationDates'
import { toExportRows } from 'map/mapExportData'
import { assessImageExport } from 'map/mapImageExportRights'
import MapComparePanel from 'map/MapComparePanel'
import MapExportPanel from 'map/MapExportPanel'
import MapMeasurePanel from 'map/MapMeasurePanel'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import MapTerrainPanel from 'map/MapTerrainPanel'
import MapTimelinePanel from 'map/MapTimelinePanel'
import Map3dPanel, { type Map3dPanelProps } from 'map/Map3dPanel'
import type { MapElevationProfile } from 'map/useMapElevationProfile'
import type { MapPanelDefinition } from 'map/MapToolbar'

export interface ToolPanelsInput {
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly dataStatus: FindspotMapDataStatus
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
  mapRef,
  dataStatus,
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
  const visiblePolygons = useMapExportPolygons(mapRef, excavationPolygonIndex)
  const findspots = useMemo(
    () =>
      [...polygonSummaries.values()].flatMap((summary) => summary.findspots),
    [polygonSummaries],
  )
  const exportRows = useMemo(
    () =>
      dataStatus === 'loaded'
        ? toExportRows(visiblePolygons, polygonSummaries)
        : [],
    [dataStatus, visiblePolygons, polygonSummaries],
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
            cornerCount={interactions.cornerCount}
            onAddCornerAtCenter={interactions.addCornerAtCenter}
            findspots={findspots}
            dataStatus={dataStatus}
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
            onAddPointAtCenter={interactions.addMeasurementAtCenter}
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
            dataStatus={dataStatus}
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
      findspots,
      dataStatus,
      imageExport,
      visualization,
      siteFilter,
      interactions,
      elevation,
      threeD,
    ],
  )
}
