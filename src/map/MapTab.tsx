import React from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Spinner from 'common/ui/Spinner'
import useMapTabState from 'map/useMapTabState'
import MapStage from 'map/MapStage'
import MapPanelDock from 'map/MapPanelDock'
import MapExperienceHeader from 'map/MapExperienceHeader'
import MapPresentationBar from 'map/MapPresentationBar'
import MapSelectionPill from 'map/MapSelectionPill'
import MapLayerControls from 'map/MapLayerControls'
import MapInspector from 'map/MapInspector'
import MapLegend from 'map/MapLegend'
import MapVisualizationControl from 'map/MapVisualizationControl'
import MapMeasurePanel from 'map/MapMeasurePanel'
import MapSpatialSearchPanel from 'map/MapSpatialSearchPanel'
import MapExportPanel from 'map/MapExportPanel'
import MapTerrainPanel from 'map/MapTerrainPanel'
import { assessImageExport } from 'map/mapImageExportRights'
import { findMapSite } from 'map/mapSites'
import type { MapPanelDefinition } from 'map/MapToolbar'
import FindspotFilterInput from 'map/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/FindspotResults'
import 'map/MapTab.sass'

interface Props {
  findspotService: FindspotService
  fragmentService: FragmentService
}

function LoadedMapTab({
  state,
}: {
  state: ReturnType<typeof useMapTabState>
}): JSX.Element {
  const { experience, panel, filteredProvenances, selectedPolygon } = state
  const isPresenting = experience.presentation.isActive

  const panels: readonly MapPanelDefinition[] = [
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

  return (
    <div
      className={`map-tab map-experience${
        isPresenting ? ' map-experience--presenting' : ''
      }`}
    >
      {isPresenting ? (
        <MapPresentationBar title={null} onExit={experience.presentation.exit} />
      ) : (
        <MapExperienceHeader
          visibleSiteCount={filteredProvenances?.length ?? 0}
          onResetView={state.resetView}
          onEnterPresentation={experience.presentation.enter}
          filterControl={
            <FindspotFilterInput
              provenances={state.provenances ?? []}
              filter={experience.filter}
              onFilterChange={experience.setFilter}
            />
          }
        />
      )}
      <div className="map-experience__body">
        <MapStage
          containerRef={state.mapContainer}
          isBackgroundUnavailable={state.isBackgroundUnavailable}
          describedById="findspot-map-description"
          legend={
            !isPresenting && state.showExcavationAreas ? (
              <MapLegend
                mode={state.visualization.effectiveMode}
                legend={state.visualization.legend}
              />
            ) : null
          }
          overlay={
            isPresenting ? null : (
              <>
                <MapPanelDock
                  panels={panels}
                  panel={panel}
                  drawerRef={state.drawerRef}
                />
                {selectedPolygon && panel.active !== 'inspector' ? (
                  <MapSelectionPill
                    label="Show selected area"
                    onShow={() => panel.open('inspector')}
                  />
                ) : null}
              </>
            )
          }
        />
      </div>
      {isPresenting ? null : (
        <>
          <p id="findspot-map-description" className="map-tab__description">
            Matching fragment search links are available below the map.
          </p>
          <FindspotEmptyState
            provenances={filteredProvenances ?? []}
            filter={experience.filter}
          />
          <FindspotSearchList provenances={filteredProvenances ?? []} />
        </>
      )}
    </div>
  )
}

export default function MapTab({
  findspotService,
  fragmentService,
}: Props): JSX.Element {
  const state = useMapTabState(findspotService, fragmentService)

  if (state.provenanceError) {
    return (
      <Alert variant="danger">
        Failed to load map data: {state.provenanceError}
      </Alert>
    )
  }

  if (state.provenances === null) {
    return <Spinner>Loading map data...</Spinner>
  }

  return <LoadedMapTab state={state} />
}
