import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import Spinner from 'common/ui/Spinner'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/useFindspotMap'
import useMapSourceData from 'map/useMapSourceData'
import useProvenances from 'map/useProvenances'
import useMapUrlState from 'map/useMapUrlState'
import MapStage from 'map/MapStage'
import MapShareLink from 'map/MapShareLink'
import FindspotFilterInput from 'map/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/FindspotResults'
import { filterProvenances } from 'map/findspotFilter'
import 'map/MapTab.sass'

interface Props {
  fragmentService: FragmentService
}

function LoadedMapTab({
  provenances,
}: {
  provenances: readonly ProvenanceRecord[]
}): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const { state, update } = useMapUrlState()
  const filter = state.filter
  const setFilter = useCallback(
    (nextFilter: string) => update({ filter: nextFilter }),
    [update],
  )

  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, filter),
    [provenances, filter],
  )
  const handleMapBackgroundErrorChange = useCallback((hasError: boolean) => {
    setMapBackgroundError(hasError)
  }, [])
  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    handleMapBackgroundErrorChange,
  )
  useMapSourceData(mapRef, filteredProvenances)

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
      <p id="findspot-map-description" className="map-tab__description">
        Filter findspots by name. Matching fragment search links are available
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
