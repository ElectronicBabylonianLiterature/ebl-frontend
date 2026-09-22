import React, { useEffect, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Spinner from 'common/ui/Spinner'
import useMapTabState, { type MapTabState } from 'map/useMapTabState'
import useProvenances from 'map/useProvenances'
import MapStage from 'map/MapStage'
import MapPanelDock from 'map/MapPanelDock'
import MapExperienceHeader from 'map/MapExperienceHeader'
import MapPresentationBar from 'map/MapPresentationBar'
import MapLayerControls from 'map/MapLayerControls'
import MapInspector from 'map/MapInspector'
import MapLegend from 'map/MapLegend'
import MapVisualizationControl from 'map/MapVisualizationControl'
import MapSelectionPill from 'map/MapSelectionPill'
import MapExcavationAreaSelector from 'map/MapExcavationAreaSelector'
import { findMapSite, isMapSiteId } from 'map/mapSites'
import type { MapPanelDefinition } from 'map/MapToolbar'
import FindspotFilterInput from 'map/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/FindspotResults'
import 'map/MapTab.sass'

interface Props {
  readonly findspotService: FindspotService
  readonly fragmentService: FragmentService
}

function LoadedMapTab({
  findspotService,
  provenances,
}: {
  readonly findspotService: FindspotService
  readonly provenances: MapTabState['provenances']
}): JSX.Element {
  const state = useMapTabState(findspotService, provenances)
  const {
    experience,
    panel,
    filteredProvenances,
    selectedPolygon,
    visibleFindspotCount,
  } = state
  const isPresenting = experience.presentation.isActive
  const presentationTriggerRef = useRef<HTMLButtonElement>(null)
  const wasPresentingRef = useRef(false)

  useEffect(() => {
    if (wasPresentingRef.current && !isPresenting) {
      presentationTriggerRef.current?.focus()
    }
    wasPresentingRef.current = isPresenting
  }, [isPresenting])

  const clearSelection = (): void => {
    experience.setSelection(null)
    panel.close()
  }

  const selectedSiteData =
    selectedPolygon && isMapSiteId(selectedPolygon.siteId)
      ? state.fragmentMapData.sites.get(selectedPolygon.siteId)
      : undefined

  const panels: readonly MapPanelDefinition[] = [
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
          onModeChange={experience.setVisualization}
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

  return (
    <div
      className={`map-tab map-experience${
        isPresenting ? ' map-experience--presenting' : ''
      }`}
    >
      {isPresenting ? (
        <MapPresentationBar
          title={null}
          onExit={experience.presentation.exit}
        />
      ) : (
        <MapExperienceHeader
          visibleSiteCount={visibleFindspotCount}
          onResetView={state.resetView}
          presentationTriggerRef={presentationTriggerRef}
          onEnterPresentation={experience.presentation.enter}
          filterControl={
            <FindspotFilterInput
              provenances={state.provenances}
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
          showFallbackHint={!isPresenting}
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
      {state.isExcavationAreasUnavailable ? (
        <Alert variant="warning">Excavation areas are unavailable.</Alert>
      ) : null}
      <p
        id="findspot-map-description"
        className={isPresenting ? 'visually-hidden' : 'map-tab__description'}
      >
        {isPresenting
          ? 'Interactive findspot map in presentation mode.'
          : 'Matching fragment search links are available below the map.'}
      </p>
      {isPresenting ? null : (
        <>
          <FindspotEmptyState
            provenances={filteredProvenances}
            filter={experience.filter}
          />
          <FindspotSearchList provenances={filteredProvenances} />
        </>
      )}
    </div>
  )
}

export default function MapTab({
  findspotService,
  fragmentService,
}: Props): JSX.Element {
  const { provenances, error } = useProvenances(fragmentService)

  if (error) {
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  }

  if (provenances === null) {
    return <Spinner>Loading map data...</Spinner>
  }

  return (
    <LoadedMapTab findspotService={findspotService} provenances={provenances} />
  )
}
