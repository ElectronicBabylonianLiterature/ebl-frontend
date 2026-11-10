import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spinner from 'common/ui/Spinner'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useProvenances, { ProvenanceSource } from 'map/ui/useProvenances'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import useMapExperience from 'map/ui/useMapExperience'
import useMapPanel from 'map/ui/useMapPanel'
import useMapLayoutEffects from 'map/ui/useMapLayoutEffects'
import { resetMapCamera } from 'map/maplibre/mapCamera'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/domain/mapSiteCapabilities'
import MapStage from 'map/ui/MapStage'
import MapPanelDock from 'map/ui/MapPanelDock'
import MapExperienceHeader from 'map/ui/MapExperienceHeader'
import MapPresentationBar from 'map/ui/MapPresentationBar'
import useMapPresentationFocus from 'map/ui/useMapPresentationFocus'
import MapLayerControls from 'map/ui/MapLayerControls'
import type { MapPanelDefinition } from 'map/ui/MapToolbar'
import FindspotFilterInput from 'map/ui/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/ui/FindspotResults'
import { filterProvenances } from 'map/domain/findspotFilter'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
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
  const drawerRef = useRef<HTMLElement>(null)
  const presentationTriggerRef = useRef<HTMLButtonElement>(null)
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const [mapExcavationAreasError, setMapExcavationAreasError] = useState(false)
  const [cameraResetVersion, setCameraResetVersion] = useState(0)

  const experience = useMapExperience()
  const panel = useMapPanel()
  const isPresenting = experience.presentation.isActive
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
    experience.showExcavationAreas && canShowExcavationAreas

  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, experience.filter),
    [provenances, experience.filter],
  )
  const visibleFindspotCount = useMemo(
    () => provenanceToGeoJson(filteredProvenances).features.length,
    [filteredProvenances],
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
    cameraResetVersion,
  )
  useMapSourceData(mapRef, filteredProvenances, cameraResetVersion)
  useExcavationAreas(
    mapRef,
    showExcavationAreas,
    handleExcavationAreasAvailabilityChange,
    isPolygonIndexLoaded && polygonIndexError === null ? polygonIndex : null,
  )
  useMapLayoutEffects(
    mapContainer,
    mapRef,
    drawerRef,
    isPresenting ? null : panel.active,
  )

  const resetView = useCallback(() => {
    setCameraResetVersion((current) => current + 1)
    experience.resetState()
    resetMapCamera(mapRef.current)
  }, [experience, mapRef])

  const panels: readonly MapPanelDefinition[] = [
    {
      id: 'layers',
      label: 'Map layers',
      isSupported: true,
      render: () => (
        <>
          {!isPolygonIndexLoaded ? (
            <p role="status">Loading excavation areas…</p>
          ) : null}
          <MapLayerControls
            showExcavationAreas={showExcavationAreas}
            canShowExcavationAreas={canShowExcavationAreas}
            onShowExcavationAreasChange={experience.setShowExcavationAreas}
          />
        </>
      ),
    },
  ]

  const excavationStatus =
    excavationAreasUnavailable &&
    (experience.showExcavationAreas ||
      (!isPresenting && panel.active === 'layers')) ? (
      <Alert variant="warning">Excavation areas are unavailable.</Alert>
    ) : null

  return (
    <div
      className={`map-tab map-experience${isPresenting ? ' map-experience--presenting' : ''}`}
    >
      {isPresenting ? (
        <MapPresentationBar onExit={experience.presentation.exit} />
      ) : (
        <MapExperienceHeader
          visibleSiteCount={visibleFindspotCount}
          onResetView={resetView}
          presentationTriggerRef={presentationTriggerRef}
          onEnterPresentation={experience.presentation.enter}
          filterControl={
            <FindspotFilterInput
              provenances={provenances}
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
          containerRef={mapContainer}
          isBackgroundUnavailable={mapBackgroundError}
          describedById="findspot-map-description"
          showFallbackHint={!isPresenting}
          overlay={
            <MapPanelDock
              panels={isPresenting ? [] : panels}
              status={excavationStatus}
              panel={panel}
              drawerRef={drawerRef}
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
