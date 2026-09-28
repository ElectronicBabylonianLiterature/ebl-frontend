import React, { type RefObject } from 'react'
import { Alert } from 'react-bootstrap'
import MapExperienceHeader from 'map/MapExperienceHeader'
import FindspotFilterInput from 'map/FindspotFilterInput'
import MapPanelDock from 'map/MapPanelDock'
import MapPresentationBar from 'map/MapPresentationBar'
import MapSelectionPill from 'map/MapSelectionPill'
import MapStage from 'map/MapStage'
import { FindspotEmptyState, FindspotSearchList } from 'map/FindspotResults'
import type { MapTabState } from 'map/useMapTabState'
import type { MapPanelDefinition } from 'map/MapToolbar'

interface Props {
  readonly state: MapTabState
  readonly panels: readonly MapPanelDefinition[]
  readonly presentationTriggerRef: RefObject<HTMLButtonElement>
  readonly selectionPanelId: MapPanelDefinition['id']
}

export default function MapTabLoadedView({
  state,
  panels,
  presentationTriggerRef,
  selectionPanelId,
}: Props): JSX.Element {
  const {
    experience,
    panel,
    filteredProvenances,
    selectedPolygon,
    visibleFindspotCount,
  } = state
  const isPresenting = experience.presentation.isActive

  return (
    <div
      className={`map-tab map-experience${isPresenting ? ' map-experience--presenting' : ''}`}
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
          overlay={
            isPresenting ? null : (
              <>
                <MapPanelDock
                  panels={panels}
                  panel={panel}
                  drawerRef={state.drawerRef}
                />
                {selectedPolygon && panel.active !== selectionPanelId ? (
                  <MapSelectionPill
                    label="Show selected area"
                    onShow={() => panel.open(selectionPanelId)}
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
