import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import Spinner from 'common/ui/Spinner'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/useFindspotMap'
import useMapSourceData from 'map/useMapSourceData'
import useProvenances from 'map/useProvenances'
import useExcavationAreas from 'map/useExcavationAreas'
import useExcavationPolygonIndex from 'map/useExcavationPolygonIndex'
import useMapExperience from 'map/useMapExperience'
import useMapPanel from 'map/useMapPanel'
import useMapLayoutEffects from 'map/useMapLayoutEffects'
import { resetMapCamera } from 'map/mapCamera'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/mapSiteCapabilities'
import MapStage from 'map/MapStage'
import MapPanelDock from 'map/MapPanelDock'
import MapExperienceHeader from 'map/MapExperienceHeader'
import MapPresentationBar from 'map/MapPresentationBar'
import MapLayerControls from 'map/MapLayerControls'
import type { MapPanelDefinition } from 'map/MapToolbar'
import FindspotFilterInput from 'map/FindspotFilterInput'
import { FindspotEmptyState, FindspotSearchList } from 'map/FindspotResults'
import { filterProvenances } from 'map/findspotFilter'
import { provenanceToGeoJson } from 'map/provenanceToGeoJson'
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
  const drawerRef = useRef<HTMLElement>(null)
  const presentationTriggerRef = useRef<HTMLButtonElement>(null)
  const wasPresentingRef = useRef(false)
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const [mapExcavationAreasError, setMapExcavationAreasError] = useState(false)
  const [cameraResetVersion, setCameraResetVersion] = useState(0)

  const experience = useMapExperience()
  const panel = useMapPanel()
  const isPresenting = experience.presentation.isActive

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
  )
  useMapLayoutEffects(
    mapContainer,
    mapRef,
    drawerRef,
    isPresenting ? null : panel.active,
  )

  useEffect(() => {
    if (wasPresentingRef.current && !isPresenting) {
      presentationTriggerRef.current?.focus()
    }
    wasPresentingRef.current = isPresenting
  }, [isPresenting])

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
        <MapLayerControls
          showExcavationAreas={showExcavationAreas}
          canShowExcavationAreas={canShowExcavationAreas}
          onShowExcavationAreasChange={experience.setShowExcavationAreas}
        />
      ),
    },
  ]

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
      <div className="map-experience__body">
        <MapStage
          containerRef={mapContainer}
          isBackgroundUnavailable={mapBackgroundError}
          describedById="findspot-map-description"
          showFallbackHint={!isPresenting}
          overlay={
            isPresenting ? null : (
              <MapPanelDock
                panels={panels}
                panel={panel}
                drawerRef={drawerRef}
              />
            )
          }
        />
      </div>
      {excavationAreasUnavailable ? (
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
