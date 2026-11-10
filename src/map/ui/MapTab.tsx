import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spinner from 'common/ui/Spinner'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useProvenances, { ProvenanceSource } from 'map/ui/useProvenances'
import useMapUrlState from 'map/ui/useMapUrlState'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/domain/mapSiteCapabilities'
import MapStage from 'map/ui/MapStage'
import MapShareLink from 'map/ui/MapShareLink'
import MapLayerControls from 'map/ui/MapLayerControls'
import FindspotFilterInput from 'map/ui/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'
import { filterProvenances } from 'map/domain/findspotFilter'
import 'map/ui/MapTab.sass'

interface Props {
  fragmentService: ProvenanceSource
}

function LoadedMapTab({
  provenances,
}: {
  provenances: readonly ProvenanceRecord[]
}): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const [mapExcavationAreasError, setMapExcavationAreasError] = useState(false)
  const { state, update } = useMapUrlState()
  const filter = state.filter
  const setFilter = useCallback(
    (nextFilter: string) => update({ filter: nextFilter }),
    [update],
  )

  const {
    index: polygonIndex,
    isLoaded: isPolygonIndexLoaded,
    error: polygonIndexError,
  } = useExcavationPolygonIndex()
  const excavationAreasUnavailable =
    polygonIndexError !== null || mapExcavationAreasError
  const canShowExcavationAreas = useMemo(
    () =>
      isPolygonIndexLoaded &&
      !excavationAreasUnavailable &&
      anySiteHasExcavationPolygons(deriveMapSiteCapabilities(polygonIndex)),
    [excavationAreasUnavailable, isPolygonIndexLoaded, polygonIndex],
  )
  const showExcavationAreas =
    state.showExcavationAreas && canShowExcavationAreas

  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, filter),
    [provenances, filter],
  )
  const handleMapBackgroundErrorChange = useCallback((hasError: boolean) => {
    setMapBackgroundError(hasError)
  }, [])
  const handleExcavationAreasAvailabilityChange = useCallback(
    (isUnavailable: boolean) => {
      setMapExcavationAreasError(isUnavailable)
    },
    [],
  )
  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    handleMapBackgroundErrorChange,
  )
  useMapSourceData(mapRef, filteredProvenances)
  useExcavationAreas(
    mapRef,
    showExcavationAreas,
    handleExcavationAreasAvailabilityChange,
    isPolygonIndexLoaded && polygonIndexError === null ? polygonIndex : null,
  )

  return (
    <div className="map-tab">
      <div className="map-tab__search mb-3">
        <FindspotFilterInput
          provenances={provenances}
          filter={filter}
          onFilterChange={setFilter}
        />
        <MapShareLink />
      </div>
      <MapLayerControls
        showExcavationAreas={showExcavationAreas}
        canShowExcavationAreas={canShowExcavationAreas}
        onShowExcavationAreasChange={(isVisible) =>
          update({ showExcavationAreas: isVisible })
        }
      />
      {!isPolygonIndexLoaded ? (
        <p role="status">Loading excavation areas…</p>
      ) : null}
      {excavationAreasUnavailable ? (
        <Alert variant="warning">Excavation areas are unavailable.</Alert>
      ) : null}
      <p id="findspot-map-description" className="map-tab__description">
        Filter findspots by name. Matching tablet search links are available
        below the map.
      </p>
      <FindspotEmptyState provenances={filteredProvenances} filter={filter} />
      <MapStage
        containerRef={mapContainer}
        isBackgroundUnavailable={mapBackgroundError}
        describedById="findspot-map-description"
      />
      <FindspotSearchList provenances={filteredProvenances} />
    </div>
  )
}

export default function MapTab({ fragmentService }: Props): JSX.Element {
  const { provenances, error } = useProvenances(fragmentService)

  if (error) {
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  }

  if (provenances === null) {
    return <Spinner>Loading map data...</Spinner>
  }

  return <LoadedMapTab provenances={provenances} />
}
