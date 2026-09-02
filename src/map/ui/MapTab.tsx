import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import Spinner from 'common/ui/Spinner'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useProvenances from 'map/ui/useProvenances'
import FindspotFilterInput from 'map/ui/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'
import { filterProvenances } from 'map/domain/findspotFilter'
import 'map/ui/MapTab.sass'

interface Props {
  fragmentService: FragmentService
}

export default function MapTab({ fragmentService }: Props): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const { provenances, error } = useProvenances(fragmentService)
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const [filter, setFilter] = useState('')

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

  if (error) {
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  }

  if (!filteredProvenances) {
    return <Spinner>Loading map data...</Spinner>
  }

  return (
    <div className="map-tab">
      <div className="map-tab__search mb-3">
        <FindspotFilterInput
          provenances={provenances ?? []}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>
      <p id="findspot-map-description" className="map-tab__description">
        Filter findspots by name. Matching fragment search links are available
        below the map.
      </p>
      {mapBackgroundError && (
        <Alert variant="warning" className="map-tab__map-error">
          The interactive map could not be loaded. Findspot links remain
          available below.
        </Alert>
      )}
      <FindspotEmptyState provenances={filteredProvenances} filter={filter} />
      <div
        ref={mapContainer}
        className="map-tab__container"
        role="region"
        aria-label="Interactive findspot map"
        aria-describedby="findspot-map-description"
      />
      <FindspotSearchList provenances={filteredProvenances} />
    </div>
  )
}
