import React from 'react'
import { Alert, Button } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spinner from 'common/ui/Spinner'
import type { FindspotService } from 'fragmentarium/application/FindspotService'
import useProvenances, { type ProvenanceSource } from 'map/ui/useProvenances'
import useMapTabState from 'map/ui/useMapTabState'
import MapExperienceHeader from 'map/ui/MapExperienceHeader'
import MapLayerControls from 'map/ui/MapLayerControls'
import MapStage from 'map/ui/MapStage'
import MapLegend from 'map/ui/MapLegend'
import MapResearchSidebar from 'map/ui/MapResearchSidebar'
import FindspotFilterInput from 'map/ui/FindspotFilterInput'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import 'map/ui/MapTab.sass'

interface Props {
  readonly fragmentService: ProvenanceSource
  readonly findspotService: FindspotService
}

function LoadedMapTab({
  provenances,
  findspotService,
}: {
  readonly provenances: readonly ProvenanceRecord[]
  readonly findspotService: FindspotService
}): JSX.Element {
  const state = useMapTabState(findspotService, provenances)
  return (
    <div className="map-tab map-experience">
      <MapExperienceHeader
        visibleSiteCount={state.visibleFindspotCount}
        onResetView={state.resetView}
        filterControl={
          <div ref={state.searchContainer}>
            <FindspotFilterInput
              provenances={provenances}
              filter={state.experience.filter}
              onFilterChange={state.experience.setFilter}
            />
          </div>
        }
        layerControl={
          <MapLayerControls
            showExcavationAreas={state.experience.showExcavationAreas}
            onShowExcavationAreasChange={
              state.experience.setShowExcavationAreas
            }
          />
        }
      />
      {state.isExcavationAreasLoading ? (
        <p role="status">Loading excavation areas…</p>
      ) : null}
      {state.isExcavationAreasUnavailable ? (
        <Alert variant="warning" className="map-experience__layer-warning">
          <span>Excavation areas are unavailable.</span>{' '}
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={state.retryAreas}
          >
            Retry excavation areas
          </Button>
        </Alert>
      ) : null}
      <div className="map-experience__body">
        <MapStage
          containerRef={state.mapContainer}
          isBackgroundUnavailable={state.isBackgroundUnavailable}
          describedById="findspot-map-description"
          showFallbackHint
          legend={
            state.showExcavationAreas ? (
              <MapLegend
                mode={state.visualization.effectiveMode}
                legend={state.visualization.legend}
              />
            ) : null
          }
        />
        <MapResearchSidebar state={state} />
      </div>
      <p id="findspot-map-description" className="map-tab__description">
        Explore mapped sites and excavation areas. Site details and Library
        searches are available beside or below the map.
      </p>
    </div>
  )
}

export default function MapTab({
  fragmentService,
  findspotService,
}: Props): JSX.Element {
  const { provenances, error } = useProvenances(fragmentService)
  if (error)
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  if (provenances === null) return <Spinner>Loading map data...</Spinner>
  return (
    <LoadedMapTab provenances={provenances} findspotService={findspotService} />
  )
}
