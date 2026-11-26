import React, { useMemo, useRef, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spinner from 'common/ui/Spinner'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { FindspotService } from 'fragmentarium/application/FindspotService'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useProvenances, { ProvenanceSource } from 'map/ui/useProvenances'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import useMapFeatureSelection from 'map/maplibre/useMapFeatureSelection'
import useMapExperience from 'map/ui/useMapExperience'
import useMapContainerResize from 'map/ui/useMapContainerResize'
import useMapCameraOwnership from 'map/maplibre/useMapCameraOwnership'
import useMapResearchSelection from 'map/ui/useMapResearchSelection'
import useMapLinkedAreaSelection from 'map/ui/useMapLinkedAreaSelection'
import useMapLinkedTablets from 'map/ui/useMapLinkedTablets'
import { findExcavationPolygon } from 'map/domain/excavationPolygonIndex'
import { resetMapCamera } from 'map/maplibre/mapCamera'
import { focusFindspot } from 'map/maplibre/focusFindspot'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/domain/mapSiteCapabilities'
import MapStage from 'map/ui/MapStage'
import MapExperienceHeader from 'map/ui/MapExperienceHeader'
import MapLayerControls from 'map/ui/MapLayerControls'
import MapSelectionInspector from 'map/ui/MapSelectionInspector'
import MapInspector from 'map/ui/MapInspector'
import { polygonLinkedData } from 'map/domain/polygonLinkedData'
import MapExcavationBrowser from 'map/ui/MapExcavationBrowser'
import FindspotFilterInput from 'map/ui/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'
import { filterProvenances } from 'map/domain/findspotFilter'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
import 'map/ui/MapTab.sass'

interface Props {
  fragmentService: ProvenanceSource
  findspotService: FindspotService
}

function LoadedMapTab({
  provenances,
  findspotService,
}: {
  provenances: readonly ProvenanceRecord[]
  findspotService: FindspotService
}): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const searchContainer = useRef<HTMLDivElement>(null)
  const experience = useMapExperience()
  const researchState = useMapResearchSelection(
    searchContainer,
    experience.filter,
  )
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const [mapExcavationAreasError, setMapExcavationAreasError] = useState(false)
  const [areasRetryVersion, setAreasRetryVersion] = useState(0)
  const polygons = useExcavationPolygonIndex()
  const {
    index: polygonIndex,
    isLoaded: isPolygonIndexLoaded,
    error: polygonIndexError,
    retry,
  } = polygons
  const canShowExcavationAreas =
    isPolygonIndexLoaded &&
    polygonIndexError === null &&
    anySiteHasExcavationPolygons(deriveMapSiteCapabilities(polygonIndex))
  const excavationAreasUnavailable =
    polygonIndexError !== null || mapExcavationAreasError
  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, experience.filter),
    [provenances, experience.filter],
  )
  const visibleFeatures = useMemo(
    () => provenanceToGeoJson(filteredProvenances).features,
    [filteredProvenances],
  )
  const camera = useMapCameraOwnership(filteredProvenances)
  const areaSelection = useMapLinkedAreaSelection({
    experience,
    research: researchState,
    polygonIndex,
    isLoaded: isPolygonIndexLoaded,
    error: polygonIndexError,
    onSelectFromUrl: camera.claim,
  })
  const research = { ...researchState, ...areaSelection }
  const linkedData = useMapLinkedTablets({
    findspotService,
    polygons,
    isVisible: experience.showExcavationAreas,
    selectedAreaId: research.selectedAreaId,
  })
  const mapRef = useFindspotMap(mapContainer, filteredProvenances, {
    onMapBackgroundErrorChange: setMapBackgroundError,
    camera,
    onFindspotSelect: research.selectSite,
    onExcavationSelect: research.selectArea,
  })
  useMapSourceData(mapRef, filteredProvenances, camera)
  useExcavationAreas(
    mapRef,
    experience.showExcavationAreas && canShowExcavationAreas,
    setMapExcavationAreasError,
    isPolygonIndexLoaded && polygonIndexError === null ? polygonIndex : null,
    areasRetryVersion,
  )
  useMapContainerResize(mapContainer, mapRef)
  useMapFeatureSelection(
    mapRef,
    research.selectedSiteId,
    research.selectedAreaId,
    polygonIndex,
    areasRetryVersion,
  )
  return (
    <div className="map-tab map-experience">
      <MapExperienceHeader
        visibleSiteCount={visibleFeatures.length}
        onResetView={() => {
          camera.claim()
          resetMapCamera(mapRef.current)
        }}
        filterControl={
          <div ref={searchContainer}>
            <FindspotFilterInput
              provenances={provenances}
              filter={experience.filter}
              onFilterChange={experience.setFilter}
            />
          </div>
        }
        layerControl={
          <MapLayerControls
            showExcavationAreas={experience.showExcavationAreas}
            onShowExcavationAreasChange={experience.setShowExcavationAreas}
          />
        }
      />
      {!isPolygonIndexLoaded ? (
        <p role="status">Loading excavation areas…</p>
      ) : null}
      {excavationAreasUnavailable ? (
        <Alert variant="warning" className="map-experience__layer-warning">
          <span>Excavation areas are unavailable.</span>{' '}
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setMapExcavationAreasError(false)
              setAreasRetryVersion((current) => current + 1)
              retry()
            }}
          >
            Retry excavation areas
          </Button>
        </Alert>
      ) : null}
      <div className="map-experience__body">
        <MapStage
          containerRef={mapContainer}
          isBackgroundUnavailable={mapBackgroundError}
          describedById="findspot-map-description"
          showFallbackHint
        />
        <aside className="map-research-panel" aria-label="Site research">
          <MapSelectionInspector
            research={research}
            provenances={provenances}
            polygonIndex={polygonIndex}
            renderAreaDetails={(polygon) => (
              <MapInspector
                key={polygon.polygonId}
                polygon={polygon}
                {...polygonLinkedData(linkedData, polygon)}
              />
            )}
          />
          <MapExcavationBrowser
            polygonIndex={polygonIndex}
            selectedId={research.selectedAreaId}
            onSelect={(id, trigger) => {
              camera.claim()
              research.selectArea(id, trigger, false)
              const polygon = findExcavationPolygon(polygonIndex, id)
              if (polygon?.bounds && mapRef.current)
                mapRef.current.fitBounds(
                  [...polygon.bounds] as [number, number, number, number],
                  {
                    padding: 40,
                    maxZoom: 17,
                  },
                )
            }}
          />
          <FindspotEmptyState
            provenances={filteredProvenances}
            filter={experience.filter}
          />
          <FindspotSearchList
            provenances={filteredProvenances}
            selectedId={research.selectedSiteId}
            onSelect={(id, trigger) => {
              camera.claim()
              research.selectSite(id, trigger)
              const feature = visibleFeatures.find((entry) => entry.id === id)
              if (feature && mapRef.current) {
                focusFindspot(
                  mapRef.current,
                  feature.geometry.coordinates as [number, number],
                  filteredProvenances.find((entry) => entry.id === id),
                )
              }
            }}
          />
        </aside>
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
