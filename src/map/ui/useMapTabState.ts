import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FindspotService } from 'fragmentarium/application/FindspotService'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/maplibre/useFindspotMap'
import useMapSourceData from 'map/maplibre/useMapSourceData'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import useExcavationPolygonIndex from 'map/maplibre/useExcavationPolygonIndex'
import useMapCameraOwnership from 'map/maplibre/useMapCameraOwnership'
import useMapFeatureSelection from 'map/maplibre/useMapFeatureSelection'
import useMapExperience from 'map/ui/useMapExperience'
import useMapTools from 'map/ui/useMapTools'
import useMapPanelAvailability from 'map/ui/useMapPanelAvailability'
import useMapVisualization from 'map/ui/useMapVisualization'
import useMapMeasurement from 'map/ui/useMapMeasurement'
import useMapSpatialSearch from 'map/ui/useMapSpatialSearch'
import useMapResearchSelection from 'map/ui/useMapResearchSelection'
import useMapLinkedAreaSelection from 'map/ui/useMapLinkedAreaSelection'
import useMapLinkedTablets from 'map/ui/useMapLinkedTablets'
import useMapContainerResize from 'map/ui/useMapContainerResize'
import { resetMapCamera } from 'map/maplibre/mapCamera'
import { focusFindspot } from 'map/maplibre/focusFindspot'
import { fitExcavationArea } from 'map/maplibre/fitExcavationArea'
import { filterProvenances } from 'map/domain/findspotFilter'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
import {
  sortedExcavationPolygons,
  usablePolygonIndex,
} from 'map/domain/excavationPolygonIndex'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/domain/mapSiteCapabilities'

export type MapTabState = ReturnType<typeof useMapTabState>

export default function useMapTabState(
  findspotService: FindspotService,
  provenances: readonly ProvenanceRecord[],
) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const searchContainer = useRef<HTMLDivElement>(null)
  const experience = useMapExperience()
  const panel = useMapTools()
  const researchState = useMapResearchSelection(
    searchContainer,
    experience.filter,
  )
  const [isBackgroundUnavailable, setIsBackgroundUnavailable] = useState(false)
  const [isRenderedAreasUnavailable, setIsRenderedAreasUnavailable] =
    useState(false)
  const [areasRetryVersion, setAreasRetryVersion] = useState(0)
  const polygons = useExcavationPolygonIndex()
  const { index: polygonIndex, isLoaded, error, retry } = polygons
  const usableIndex = usablePolygonIndex(polygons)
  const canShowExcavationAreas =
    usableIndex !== null &&
    anySiteHasExcavationPolygons(deriveMapSiteCapabilities(usableIndex))
  const isExcavationAreasUnavailable =
    error !== null || isRenderedAreasUnavailable
  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, experience.filter),
    [provenances, experience.filter],
  )
  const visibleFeatures = useMemo(
    () => provenanceToGeoJson(filteredProvenances).features,
    [filteredProvenances],
  )
  const camera = useMapCameraOwnership(filteredProvenances)
  const pendingAreaFocus = useRef<string | null>(null)
  const areaSelection = useMapLinkedAreaSelection({
    experience,
    research: researchState,
    polygonIndex,
    isLoaded,
    error,
    onSelectFromUrl: (polygonId) => {
      camera.claim()
      pendingAreaFocus.current = polygonId
    },
  })
  const research = { ...researchState, ...areaSelection }
  const fragmentMapData = useMapLinkedTablets({
    findspotService,
    polygons,
    isVisible:
      experience.showExcavationAreas || panel.active === 'spatial-search',
    selectedAreaId: research.selectedAreaId,
  })
  const isMeasurementActive =
    panel.active === 'measurement' && !isBackgroundUnavailable
  const isSpatialSearchActive =
    panel.active === 'spatial-search' &&
    canShowExcavationAreas &&
    !isExcavationAreasUnavailable &&
    !isBackgroundUnavailable
  const isInteractionEnabled = !(isMeasurementActive || isSpatialSearchActive)
  const mapRef = useFindspotMap(mapContainer, filteredProvenances, {
    camera,
    onMapBackgroundErrorChange: setIsBackgroundUnavailable,
    onFindspotSelect: research.selectSite,
    onExcavationSelect: research.selectArea,
    isInteractionEnabled,
  })
  useMapSourceData(mapRef, filteredProvenances, camera)
  const visualization = useMapVisualization(
    fragmentMapData,
    polygonIndex,
    experience.visualization,
  )
  useExcavationAreas(mapRef, {
    isVisible: experience.showExcavationAreas && canShowExcavationAreas,
    polygonIndex: usableIndex,
    selectedPolygonId: research.selectedAreaId,
    paint: visualization.paint,
    values: visualization.values,
    onAvailabilityChange: setIsRenderedAreasUnavailable,
    isInteractionEnabled,
    retryVersion: areasRetryVersion,
  })
  useMapContainerResize(mapContainer, mapRef)
  useEffect(() => {
    const polygonId = pendingAreaFocus.current
    pendingAreaFocus.current = null
    if (polygonId !== null) {
      fitExcavationArea(mapRef.current, polygonIndex, polygonId)
    }
  }, [mapRef, polygonIndex, research.selectedAreaId])
  useMapFeatureSelection(mapRef, research.selectedSiteId, areasRetryVersion)
  useMapPanelAvailability(panel, {
    canShowExcavationAreas:
      canShowExcavationAreas && !isRenderedAreasUnavailable,
    isBackgroundUnavailable,
  })
  const spatialSearch = useMapSpatialSearch(
    mapRef,
    isSpatialSearchActive,
    polygonIndex,
    fragmentMapData,
  )
  const measurement = useMapMeasurement(mapRef, isMeasurementActive)
  const resetView = useCallback(() => {
    camera.claim()
    resetMapCamera(mapRef.current)
  }, [camera, mapRef])
  const retryAreas = useCallback(() => {
    setIsRenderedAreasUnavailable(false)
    setAreasRetryVersion((version) => version + 1)
    retry()
  }, [retry])
  const inspectSite = (id: string, trigger: HTMLElement): void => {
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
  }
  const inspectArea = (id: string, trigger: HTMLElement): void => {
    camera.claim()
    research.selectArea(id, trigger, false)
    fitExcavationArea(mapRef.current, polygonIndex, id)
  }
  return {
    provenances,
    filteredProvenances,
    visibleFindspotCount: visibleFeatures.length,
    mapContainer,
    searchContainer,
    mapRef,
    experience,
    panel,
    research,
    isBackgroundUnavailable,
    isExcavationAreasUnavailable,
    isExcavationAreasLoading: !isLoaded,
    canShowExcavationAreas,
    showExcavationAreas:
      experience.showExcavationAreas && canShowExcavationAreas,
    fragmentMapData,
    polygonIndex,
    visualization,
    excavationPolygons: sortedExcavationPolygons(polygonIndex),
    measurement,
    spatialSearch,
    resetView,
    retryAreas,
    inspectSite,
    inspectArea,
  }
}
