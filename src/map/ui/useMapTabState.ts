import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { MapTabState } from 'map/domain/mapTabState'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import useFragmentMapData from 'map/domain/useFragmentMapData'
import useMapExperience from 'map/ui/useMapExperience'
import useMapPanel from 'map/ui/useMapPanel'
import useMapVisualization from 'map/ui/useMapVisualization'
import useMapMeasurement from 'map/ui/useMapMeasurement'
import useMapSpatialSearch from 'map/ui/useMapSpatialSearch'
import useMapTerrain from 'map/maplibre/useMapTerrain'
import useMapLayoutEffects from 'map/ui/useMapLayoutEffects'
import { resetMapCamera } from 'map/maplibre/mapCamera'
import { filterProvenances } from 'map/domain/findspotFilter'
import useMapPanelAvailability from 'map/ui/useMapPanelAvailability'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/domain/mapSiteCapabilities'
import {
  findExcavationPolygon,
  sortedExcavationPolygons,
} from 'map/domain/excavationPolygonIndex'
import useMapExportView from 'map/ui/useMapExportView'

export type { MapTabState } from 'map/domain/mapTabState'

export default function useMapTabState(
  findspotService: FindspotService,
  provenances: readonly ProvenanceRecord[],
): MapTabState {
  const mapContainer = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const [isBackgroundUnavailable, setIsBackgroundUnavailable] = useState(false)
  const [isRenderedAreasUnavailable, setIsRenderedAreasUnavailable] =
    useState(false)
  const [cameraResetVersion, setCameraResetVersion] = useState(0)
  const experience = useMapExperience()
  const panel = useMapPanel()
  const {
    index: polygonIndex,
    isLoaded: isPolygonIndexLoaded,
    error: polygonIndexError,
  } = useExcavationPolygonIndex()
  const fragmentMapData = useFragmentMapData(
    findspotService,
    isPolygonIndexLoaded && polygonIndexError === null ? polygonIndex : null,
    experience.showExcavationAreas ||
      experience.selection !== null ||
      panel.active === 'spatial-search' ||
      panel.active === 'export',
  )
  const isExcavationAreasUnavailable =
    polygonIndexError !== null || isRenderedAreasUnavailable
  const canShowExcavationAreas = useMemo(
    () =>
      isPolygonIndexLoaded &&
      !isExcavationAreasUnavailable &&
      anySiteHasExcavationPolygons(deriveMapSiteCapabilities(polygonIndex)),
    [isExcavationAreasUnavailable, isPolygonIndexLoaded, polygonIndex],
  )
  const showExcavationAreas =
    experience.showExcavationAreas && canShowExcavationAreas
  const isMeasurementActive =
    panel.active === 'measurement' &&
    !experience.presentation.isActive &&
    !isBackgroundUnavailable
  const isSpatialSearchSupported =
    canShowExcavationAreas && !isBackgroundUnavailable
  const isSpatialSearchActive =
    panel.active === 'spatial-search' &&
    !experience.presentation.isActive &&
    isSpatialSearchSupported
  const isInteractiveToolActive = isMeasurementActive || isSpatialSearchActive
  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, experience.filter),
    [provenances, experience.filter],
  )
  const visibleFindspotCount = useMemo(
    () => provenanceToGeoJson(filteredProvenances).features.length,
    [filteredProvenances],
  )
  const onMapBackgroundError = useCallback(
    (hasError: boolean) => setIsBackgroundUnavailable(hasError),
    [],
  )
  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    onMapBackgroundError,
    cameraResetVersion,
    !isInteractiveToolActive,
  )
  useMapSourceData(mapRef, filteredProvenances, cameraResetVersion)
  const visualization = useMapVisualization(
    fragmentMapData,
    polygonIndex,
    experience.visualization,
  )
  const { setSelection } = experience
  const { open: openPanel, close: closePanel } = panel
  const onSelectPolygon = useCallback(
    (polygonId: string) => {
      setSelection({ type: 'excavation-area', polygonId })
      openPanel('inspector')
    },
    [setSelection, openPanel],
  )
  const selectedPolygonId =
    experience.selection?.type === 'excavation-area'
      ? experience.selection.polygonId
      : null
  const selectedPolygon = findExcavationPolygon(polygonIndex, selectedPolygonId)

  useEffect(() => {
    if (
      isPolygonIndexLoaded &&
      polygonIndexError === null &&
      selectedPolygonId !== null &&
      selectedPolygon === null
    ) {
      setSelection(null)
      closePanel()
    }
  }, [
    closePanel,
    isPolygonIndexLoaded,
    polygonIndexError,
    selectedPolygon,
    selectedPolygonId,
    setSelection,
  ])
  useMapPanelAvailability(panel, {
    canShowExcavationAreas,
    isBackgroundUnavailable,
    selectedPolygonId,
  })
  useExcavationAreas(mapRef, {
    isVisible: showExcavationAreas,
    polygonIndex:
      isPolygonIndexLoaded && polygonIndexError === null ? polygonIndex : null,
    selectedPolygonId,
    paint: visualization.paint,
    values: visualization.values,
    onSelectPolygon,
    onAvailabilityChange: setIsRenderedAreasUnavailable,
    isInteractionEnabled: !isInteractiveToolActive,
  })
  useMapLayoutEffects(
    mapContainer,
    mapRef,
    drawerRef,
    experience.presentation.isActive ? null : panel.active,
  )
  const terrain = useMapTerrain(mapRef, experience.terrain, {
    onUnavailable: () => experience.setTerrain(false),
  })
  const spatialSearch = useMapSpatialSearch(
    mapRef,
    isSpatialSearchActive,
    polygonIndex,
    fragmentMapData,
  )
  const measurement = useMapMeasurement(mapRef, isMeasurementActive)
  const excavationPolygons = useMemo(
    () => sortedExcavationPolygons(polygonIndex),
    [polygonIndex],
  )
  const exportView = useMapExportView(
    mapRef,
    showExcavationAreas,
    excavationPolygons,
    selectedPolygon,
    fragmentMapData,
  )
  const resetView = useCallback(() => {
    setCameraResetVersion((current) => current + 1)
    experience.resetState()
    closePanel()
    resetMapCamera(mapRef.current)
  }, [closePanel, experience, mapRef])

  return {
    provenances,
    filteredProvenances,
    visibleFindspotCount,
    mapContainer,
    drawerRef,
    mapRef,
    isBackgroundUnavailable,
    isExcavationAreasUnavailable,
    isExcavationAreasLoading: !isPolygonIndexLoaded,
    experience,
    panel,
    canShowExcavationAreas,
    showExcavationAreas,
    fragmentMapData,
    selectedPolygon,
    excavationPolygons,
    visualization,
    measurement,
    spatialSearch,
    exportView,
    terrain,
    resetView,
  }
}
