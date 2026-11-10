import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import useFragmentMapData, {
  type FragmentMapDataState,
} from 'map/domain/useFragmentMapData'
import useMapExperience, { type MapExperience } from 'map/ui/useMapExperience'
import useMapPanel, { type MapPanelController } from 'map/ui/useMapPanel'
import useMapVisualization, {
  type MapVisualization,
} from 'map/ui/useMapVisualization'
import useMapMeasurement, {
  type MeasurementController,
} from 'map/ui/useMapMeasurement'
import useMapSpatialSearch, {
  type SpatialSearchController,
} from 'map/ui/useMapSpatialSearch'
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
  type ExcavationPolygon,
} from 'map/domain/excavationPolygonIndex'
import useMapExportView, { type MapExportView } from 'map/ui/useMapExportView'

export interface MapTabState {
  readonly provenances: readonly ProvenanceRecord[]
  readonly filteredProvenances: readonly ProvenanceRecord[]
  readonly visibleFindspotCount: number
  readonly mapContainer: RefObject<HTMLDivElement>
  readonly drawerRef: RefObject<HTMLElement>
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly isBackgroundUnavailable: boolean
  readonly isExcavationAreasUnavailable: boolean
  readonly isExcavationAreasLoading: boolean
  readonly experience: MapExperience
  readonly panel: MapPanelController
  readonly canShowExcavationAreas: boolean
  readonly showExcavationAreas: boolean
  readonly fragmentMapData: FragmentMapDataState
  readonly selectedPolygon: ExcavationPolygon | null
  readonly visualization: MapVisualization
  readonly measurement: MeasurementController
  readonly spatialSearch: SpatialSearchController
  readonly exportView: MapExportView
  readonly excavationPolygons: readonly ExcavationPolygon[]
  readonly resetView: () => void
}

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
    resetView,
  }
}
