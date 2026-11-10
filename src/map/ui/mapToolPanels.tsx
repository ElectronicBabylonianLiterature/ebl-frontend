import React from 'react'
import MapExportPanel from 'map/ui/MapExportPanel'
import MapInspector from 'map/ui/MapInspector'
import MapLayerPanel from 'map/ui/MapLayerPanel'
import MapMeasurePanel from 'map/ui/MapMeasurePanel'
import MapSpatialSearchPanel from 'map/ui/MapSpatialSearchPanel'
import type { MapTabState } from 'map/ui/useMapTabState'
import MapVisualizationControl from 'map/ui/MapVisualizationControl'
import { exportDataStatuses } from 'map/domain/mapExportData'
import { assessImageExport } from 'map/domain/mapImageExportRights'
import { mapSiteName, isMapSiteId } from 'fragmentarium/domain/mapSites'
import type { MapPanelDefinition } from 'map/ui/MapToolbar'

export default function buildMapToolPanels(
  state: MapTabState,
  clearSelection: () => void,
): readonly MapPanelDefinition[] {
  const { experience, selectedPolygon } = state
  const selectedSiteData =
    selectedPolygon && isMapSiteId(selectedPolygon.siteId)
      ? state.fragmentMapData.sites.get(selectedPolygon.siteId)
      : undefined

  const inspectorPanels: readonly MapPanelDefinition[] = selectedPolygon
    ? [
        {
          id: 'inspector',
          label: 'Selected area',
          isSupported: true,
          render: () => (
            <MapInspector
              key={selectedPolygon.polygonId}
              polygon={selectedPolygon}
              summary={selectedSiteData?.polygonSummaries.get(
                selectedPolygon.polygonId,
              )}
              siteName={mapSiteName(selectedPolygon.siteId)}
              status={selectedSiteData?.status ?? 'not-configured'}
              visualizationMode={state.visualization.effectiveMode}
              siteFilter={experience.filter}
              onClear={clearSelection}
            />
          ),
        },
      ]
    : []
  return [
    ...inspectorPanels,
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
        <MapSpatialSearchPanel
          spatialSearch={state.spatialSearch}
          findspots={state.fragmentMapData.findspots}
        />
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
      render: () => <MapLayerPanel state={state} />,
    },
  ]
}
