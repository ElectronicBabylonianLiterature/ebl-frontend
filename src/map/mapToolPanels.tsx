import React from 'react'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import MapExportPanel from 'map/MapExportPanel'
import MapInspector from 'map/MapInspector'
import MapLayerControls from 'map/MapLayerControls'
import MapMeasurePanel from 'map/MapMeasurePanel'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import type { MapTabState } from 'map/useMapTabState'
import MapVisualizationControl from 'map/MapVisualizationControl'
import { exportDataStatuses } from 'map/mapExportData'
import { assessImageExport } from 'map/mapImageExportRights'
import { findMapSite, isMapSiteId } from 'map/mapSites'
import type { MapPanelDefinition } from 'map/MapToolbar'

export default function buildMapToolPanels(
  state: MapTabState,
  clearSelection: () => void,
): readonly MapPanelDefinition[] {
  const { experience, selectedPolygon } = state
  const selectedSiteData =
    selectedPolygon && isMapSiteId(selectedPolygon.siteId)
      ? state.fragmentMapData.sites.get(selectedPolygon.siteId)
      : undefined

  return [
    {
      id: 'inspector',
      label: 'Selected area',
      isSupported: selectedPolygon !== null,
      render: () =>
        selectedPolygon ? (
          <MapInspector
            polygon={selectedPolygon}
            summary={selectedSiteData?.polygonSummaries.get(
              selectedPolygon.polygonId,
            )}
            siteName={
              findMapSite(selectedPolygon.siteId)?.siteName ??
              selectedPolygon.siteId
            }
            status={selectedSiteData?.status ?? 'not-configured'}
            visualizationMode={state.visualization.effectiveMode}
            siteFilter={experience.filter}
            onClear={clearSelection}
          />
        ) : (
          <p>No excavation area is selected.</p>
        ),
    },
    {
      id: 'visualization',
      label: 'Visualization',
      isSupported: state.canShowExcavationAreas,
      render: () => (
        <MapVisualizationControl
          mode={state.visualization.effectiveMode}
          legend={state.visualization.legend}
          isDensityAvailable={state.visualization.isDensityAvailable}
          hasUnavailableData={state.visualization.hasUnavailableData}
          onModeChange={experience.setVisualization}
        />
      ),
    },
    {
      id: 'measurement',
      label: 'Measure',
      isSupported: !state.isBackgroundUnavailable,
      render: () => <MapMeasurePanel measurement={state.measurement} />,
    },
    {
      id: 'spatial-search',
      label: 'Search area',
      isSupported:
        state.canShowExcavationAreas && !state.isBackgroundUnavailable,
      render: () => (
        <MapSpatialSearchPanel spatialSearch={state.spatialSearch} />
      ),
    },
    {
      id: 'export',
      label: 'Export',
      isSupported: state.canShowExcavationAreas,
      render: () => (
        <MapExportPanel
          rows={state.exportView.rows}
          scope={state.exportView.scope}
          buildContext={() => ({
            visualization: state.visualization.effectiveMode,
            siteFilter: experience.filter,
            shareUrl: window.location.href,
            exportedAt: new Date().toISOString(),
            scope: state.exportView.scope,
            dataStatuses: exportDataStatuses(state.fragmentMapData.sites),
          })}
          imageExport={assessImageExport()}
        />
      ),
    },
    {
      id: 'layers',
      label: 'Map layers',
      isSupported: true,
      render: () => (
        <>
          <MapLayerControls
            showExcavationAreas={state.showExcavationAreas}
            canShowExcavationAreas={state.canShowExcavationAreas}
            onShowExcavationAreasChange={experience.setShowExcavationAreas}
          />
          <MapExcavationAreaSelector
            polygons={state.excavationPolygons}
            selectedPolygonId={selectedPolygon?.polygonId ?? null}
            onSelect={(polygonId) =>
              polygonId ? state.selectPolygon(polygonId) : clearSelection()
            }
          />
        </>
      ),
    },
  ]
}
