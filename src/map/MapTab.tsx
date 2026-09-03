import React from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Spinner from 'common/ui/Spinner'
import useMapTabState from 'map/useMapTabState'
import mapPanelDefinitions from 'map/mapPanelDefinitions'
import MapStage from 'map/MapStage'
import MapPanelDock from 'map/MapPanelDock'
import MapExperienceHeader from 'map/MapExperienceHeader'
import MapPresentationBar from 'map/MapPresentationBar'
import MapSelectionPill from 'map/MapSelectionPill'
import MapLegend from 'map/MapLegend'
import Map3dTourControls from 'map/Map3dTourControls'
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

  const panels = mapPanelDefinitions(state)

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
                {state.threeD.tour.canStart ? (
                  <Map3dTourControls tour={state.threeD.tour} isCompact />
                ) : null}
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
