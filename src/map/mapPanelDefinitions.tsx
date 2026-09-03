import React from 'react'
import type { MapPanelDefinition } from 'map/MapToolbar'
import type useMapTabState from 'map/useMapTabState'
import MapInspector from 'map/MapInspector'
import MapVisualizationControl from 'map/MapVisualizationControl'
import MapMeasurePanel from 'map/MapMeasurePanel'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import MapExportPanel from 'map/MapExportPanel'
import MapTerrainPanel from 'map/MapTerrainPanel'
import Map3dPanel from 'map/Map3dPanel'
import MapElevationProfilePanel from 'map/MapElevationProfilePanel'
import MapLayerControls from 'map/MapLayerControls'
import { ANALYTICAL_3D_TITLE } from 'map/map3dLabels'
import { assessImageExport } from 'map/mapImageExportRights'
import { findMapSite } from 'map/mapSites'

type MapTabState = ReturnType<typeof useMapTabState>

export default function mapPanelDefinitions(
  state: MapTabState,
): readonly MapPanelDefinition[] {
  const { experience, selectedPolygon } = state

  return [
    {
      id: 'inspector',
      label: 'Selected area',
      isSupported: selectedPolygon !== null,
      render: () =>
        selectedPolygon ? (
          <MapInspector
            polygon={selectedPolygon}
            summary={state.fragmentMapData.polygonSummaries.get(
              selectedPolygon.polygonId,
            )}
            siteName={
              findMapSite(selectedPolygon.siteId)?.siteName ??
              selectedPolygon.siteId
            }
            status={state.fragmentMapData.status}
            visualizationMode={state.visualization.effectiveMode}
            siteFilter={experience.filter}
            onClear={() => experience.setSelection(null)}
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
          onModeChange={experience.setVisualization}
        />
      ),
    },
    {
      id: 'measurement',
      label: 'Measure',
      isSupported: true,
      render: () => <MapMeasurePanel measurement={state.measurement} />,
    },
    {
      id: 'spatial-search',
      label: 'Search area',
      isSupported: state.canShowExcavationAreas,
      render: () => (
        <MapSpatialSearchPanel
          shape={state.spatialSearch.shape}
          result={state.spatialSearch.result}
          isDrawing={state.spatialSearch.isDrawing}
          onSearchViewport={state.spatialSearch.searchViewport}
          onStartDrawing={state.spatialSearch.startDrawing}
          onClear={state.spatialSearch.clear}
        />
      ),
    },
    {
      id: 'export',
      label: 'Export',
      isSupported: state.canShowExcavationAreas,
      render: () => (
        <MapExportPanel
          rows={state.exportRows}
          buildContext={() => ({
            visualization: state.visualization.effectiveMode,
            siteFilter: experience.filter,
            shareUrl: window.location.href,
            exportedAt: new Date().toISOString(),
          })}
          imageExport={assessImageExport()}
        />
      ),
    },
    {
      id: 'terrain',
      label: 'Terrain',
      isSupported: true,
      render: () => (
        <MapTerrainPanel
          terrain={state.terrain}
          isRequested={experience.terrain}
          onChange={experience.setTerrain}
        />
      ),
    },
    {
      id: 'three-d',
      label: ANALYTICAL_3D_TITLE,
      isSupported: state.canShowExcavationAreas,
      render: () => (
        <>
          <Map3dPanel {...state.threeD.panel} />
          {state.elevation.status !== 'empty' ? (
            <MapElevationProfilePanel elevation={state.elevation} />
          ) : null}
        </>
      ),
    },
    {
      id: 'layers',
      label: 'Map layers',
      isSupported: true,
      render: () => (
        <MapLayerControls
          showExcavationAreas={state.showExcavationAreas}
          canShowExcavationAreas={state.canShowExcavationAreas}
          onShowExcavationAreasChange={experience.setShowExcavationAreas}
        />
      ),
    },
  ]
}
