import React, { useRef } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import Spinner from 'common/ui/Spinner'
import type { MapTabState } from 'map/domain/mapTabState'
import useMapTabState from 'map/ui/useMapTabState'
import useProvenances, { ProvenanceSource } from 'map/ui/useProvenances'
import MapStage from 'map/ui/MapStage'
import MapPanelDock from 'map/ui/MapPanelDock'
import MapExperienceHeader from 'map/ui/MapExperienceHeader'
import MapPresentationBar from 'map/ui/MapPresentationBar'
import useMapPresentationFocus from 'map/ui/useMapPresentationFocus'
import MapLegend from 'map/ui/MapLegend'
import MapSelectionPill from 'map/ui/MapSelectionPill'
import buildMapToolPanels from 'map/ui/mapToolPanels'
import FindspotFilterInput from 'map/ui/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'
import 'map/ui/MapTab.sass'

interface Props {
  readonly findspotService: FindspotService
  readonly fragmentService: ProvenanceSource
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
  useMapPresentationFocus(presentationTriggerRef, isPresenting)
  const description = isPresenting
    ? {
        className: 'visually-hidden',
        content: 'Interactive findspot map in presentation mode.',
      }
    : {
        className: 'map-tab__description',
        content: 'Matching tablet search links are available below the map.',
      }

  const clearSelection = (): void => {
    experience.setSelection(null)
    panel.close()
  }

  const panels = buildMapToolPanels(state, clearSelection)

  const excavationStatus =
    state.isExcavationAreasUnavailable &&
    (experience.showExcavationAreas ||
      experience.selection !== null ||
      (!isPresenting && panel.active === 'layers')) ? (
      <Alert variant="warning">Excavation areas are unavailable.</Alert>
    ) : null

  return (
    <div
      className={`map-tab map-experience${
        isPresenting ? ' map-experience--presenting' : ''
      }`}
    >
      {isPresenting ? (
        <MapPresentationBar onExit={experience.presentation.exit} />
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
      {isPresenting ? null : (
        <FindspotEmptyState
          provenances={filteredProvenances}
          filter={experience.filter}
        />
      )}

      <div className="map-experience__body">
        <MapStage
          containerRef={state.mapContainer}
          isBackgroundUnavailable={state.isBackgroundUnavailable}
          describedById="findspot-map-description"
          showFallbackHint={!isPresenting}
          legend={
            state.showExcavationAreas ? (
              <MapLegend
                mode={state.visualization.effectiveMode}
                legend={state.visualization.legend}
              />
            ) : null
          }
          overlay={
            <MapPanelDock
              panels={isPresenting ? [] : panels}
              status={excavationStatus}
              panel={panel}
              drawerRef={state.drawerRef}
              selectionAction={
                selectedPolygon && panel.active !== 'inspector' ? (
                  <MapSelectionPill
                    label="Show selected area"
                    onShow={() => panel.open('inspector')}
                  />
                ) : null
              }
            />
          }
        />
      </div>
      <p id="findspot-map-description" className={description.className}>
        {description.content}
      </p>
      {isPresenting ? null : (
        <>
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
