import React, { useCallback, useMemo, useRef, useState } from 'react'
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
  const [mapBackgroundError, setMapBackgroundError] = useState(false)

  const experience = useMapExperience()
  const panel = useMapPanel()

  const { index: polygonIndex } = useExcavationPolygonIndex()
  const canShowExcavationAreas = useMemo(
    () => anySiteHasExcavationPolygons(deriveMapSiteCapabilities(polygonIndex)),
    [polygonIndex],
  )
  const showExcavationAreas =
    experience.showExcavationAreas && canShowExcavationAreas

  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, experience.filter),
    [provenances, experience.filter],
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
  useExcavationAreas(mapRef, showExcavationAreas)
  useMapLayoutEffects(mapContainer, mapRef, drawerRef, panel.active)

  const resetView = useCallback(() => {
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

  const isPresenting = experience.presentation.isActive

  return (
    <div
      className={`map-tab map-experience${
        isPresenting ? ' map-experience--presenting' : ''
      }`}
    >
      {isPresenting ? (
        <MapPresentationBar title={null} onExit={experience.presentation.exit} />
      ) : (
        <MapExperienceHeader
          visibleSiteCount={filteredProvenances?.length ?? 0}
          onResetView={resetView}
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
          overlay={
            isPresenting ? null : (
              <MapPanelDock panels={panels} panel={panel} drawerRef={drawerRef} />
            )
          }
        />
      </div>
      {isPresenting ? null : (
        <>
          <p id="findspot-map-description" className="map-tab__description">
            Matching fragment search links are available below the map.
          </p>
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
