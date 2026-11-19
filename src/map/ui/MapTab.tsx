import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spinner from 'common/ui/Spinner'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useProvenances, { ProvenanceSource } from 'map/ui/useProvenances'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import useMapFeatureSelection from 'map/maplibre/useMapFeatureSelection'
import useMapExperience from 'map/ui/useMapExperience'
import useMapContainerResize from 'map/ui/useMapContainerResize'
import { resetMapCamera } from 'map/maplibre/mapCamera'
import { focusFindspot } from 'map/maplibre/focusFindspot'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/domain/mapSiteCapabilities'
import MapStage from 'map/ui/MapStage'
import MapExperienceHeader from 'map/ui/MapExperienceHeader'
import MapLayerControls from 'map/ui/MapLayerControls'
import MapResearchInspector from 'map/ui/MapResearchInspector'
import MapExcavationBrowser from 'map/ui/MapExcavationBrowser'
import FindspotFilterInput from 'map/ui/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'
import { filterProvenances } from 'map/domain/findspotFilter'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
import 'map/ui/MapTab.sass'

interface Props {
  fragmentService: ProvenanceSource
}

interface Selection {
  readonly kind: 'site' | 'area'
  readonly id: string
}

function LoadedMapTab({
  provenances,
}: {
  provenances: readonly ProvenanceRecord[]
}): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const searchContainer = useRef<HTMLDivElement>(null)
  const selectionTrigger = useRef<HTMLElement | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const [mapExcavationAreasError, setMapExcavationAreasError] = useState(false)
  const [cameraResetVersion, setCameraResetVersion] = useState(0)
  const [areasRetryVersion, setAreasRetryVersion] = useState(0)
  const experience = useMapExperience()
  const {
    index: polygonIndex,
    isLoaded: isPolygonIndexLoaded,
    error: polygonIndexError,
    retry,
  } = useExcavationPolygonIndex()
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
  const selectMapSite = useCallback((id: string) => {
    selectionTrigger.current = document.activeElement as HTMLElement
    setSelection({ kind: 'site', id })
  }, [])
  const selectMapArea = useCallback((id: string) => {
    selectionTrigger.current = document.activeElement as HTMLElement
    setSelection({ kind: 'area', id })
  }, [])
  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    setMapBackgroundError,
    cameraResetVersion,
    selectMapSite,
    selectMapArea,
  )
  useMapSourceData(mapRef, filteredProvenances, cameraResetVersion)
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
    selection?.kind === 'site' ? selection.id : null,
    selection?.kind === 'area' ? selection.id : null,
    polygonIndex,
    areasRetryVersion,
  )
  const selectedProvenance =
    selection?.kind === 'site'
      ? provenances.find(({ id }) => id === selection.id)
      : undefined
  const selectedPolygon =
    selection?.kind === 'area'
      ? [...polygonIndex.values()]
          .flat()
          .find(({ polygonId }) => polygonId === selection.id)
      : undefined

  return (
    <div className="map-tab map-experience">
      <MapExperienceHeader
        visibleSiteCount={visibleFeatures.length}
        onResetView={() => {
          setCameraResetVersion((current) => current + 1)
          resetMapCamera(mapRef.current)
        }}
        filterControl={
          <div ref={searchContainer}>
            <FindspotFilterInput
              provenances={provenances}
              filter={experience.filter}
              onFilterChange={(filter) => {
                setSelection(null)
                experience.setFilter(filter)
              }}
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
          {selection ? (
            <MapResearchInspector
              selectionId={`${selection.kind}:${selection.id}`}
              provenance={selectedProvenance}
              polygon={selectedPolygon}
              onClose={() => {
                setSelection(null)
                if (
                  selectionTrigger.current &&
                  selectionTrigger.current !== document.body &&
                  document.contains(selectionTrigger.current)
                ) {
                  selectionTrigger.current.focus()
                } else {
                  searchContainer.current?.querySelector('input')?.focus()
                }
              }}
            />
          ) : null}
          <MapExcavationBrowser
            polygonIndex={polygonIndex}
            selectedId={selection?.kind === 'area' ? selection.id : null}
            onSelect={(id, trigger) => {
              selectionTrigger.current = trigger
              setSelection({ kind: 'area', id })
              const polygon = [...polygonIndex.values()]
                .flat()
                .find((entry) => entry.polygonId === id)
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
            selectedId={selection?.kind === 'site' ? selection.id : null}
            onSelect={(id, trigger) => {
              selectionTrigger.current = trigger
              setSelection({ kind: 'site', id })
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

export default function MapTab({ fragmentService }: Props): JSX.Element {
  const { provenances, error } = useProvenances(fragmentService)
  if (error)
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  if (provenances === null) return <Spinner>Loading map data...</Spinner>
  return <LoadedMapTab provenances={provenances} />
}
