import { useCallback, useMemo, useRef, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useFindspotMap from 'map/useFindspotMap'
import useMapSourceData from 'map/useMapSourceData'
import useExcavationAreas from 'map/useExcavationAreas'
import useExcavationPolygonIndex from 'map/useExcavationPolygonIndex'
import useFragmentMapData, {
  type FragmentMapDataState,
} from 'map/useFragmentMapData'
import useMapExperience, { type MapExperience } from 'map/useMapExperience'
import useMapPanel, { type MapPanelController } from 'map/useMapPanel'
import useMapLayoutEffects from 'map/useMapLayoutEffects'
import { resetMapCamera } from 'map/mapCamera'
import { filterProvenances } from 'map/findspotFilter'
import { provenanceToGeoJson } from 'map/provenanceToGeoJson'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/mapSiteCapabilities'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'

export interface MapTabState {
  readonly provenances: readonly ProvenanceRecord[]
  readonly filteredProvenances: readonly ProvenanceRecord[]
  readonly visibleFindspotCount: number
  readonly mapContainer: RefObject<HTMLDivElement>
  readonly drawerRef: RefObject<HTMLElement>
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly isBackgroundUnavailable: boolean
  readonly isExcavationAreasUnavailable: boolean
  readonly experience: MapExperience
  readonly panel: MapPanelController
  readonly canShowExcavationAreas: boolean
  readonly showExcavationAreas: boolean
  readonly fragmentMapData: FragmentMapDataState
  readonly selectedPolygon: ExcavationPolygon | null
  readonly resetView: () => void
}

function findPolygon(
  index: ReadonlyMap<string, readonly ExcavationPolygon[]>,
  polygonId: string | null,
): ExcavationPolygon | null {
  if (polygonId === null) return null
  for (const polygons of index.values()) {
    const match = polygons.find((polygon) => polygon.polygonId === polygonId)
    if (match) return match
  }
  return null
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
  const fragmentMapData = useFragmentMapData(findspotService)
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
  )
  useMapSourceData(mapRef, filteredProvenances, cameraResetVersion)

  const { setSelection } = experience
  const onSelectPolygon = useCallback(
    (polygonId: string) => setSelection({ type: 'excavation-area', polygonId }),
    [setSelection],
  )
  const selectedPolygonId =
    experience.selection?.type === 'excavation-area'
      ? experience.selection.polygonId
      : null

  useExcavationAreas(mapRef, {
    isVisible: showExcavationAreas,
    selectedPolygonId,
    onSelectPolygon,
    onAvailabilityChange: setIsRenderedAreasUnavailable,
  })
  useMapLayoutEffects(
    mapContainer,
    mapRef,
    drawerRef,
    experience.presentation.isActive ? null : panel.active,
  )

  const resetView = useCallback(() => {
    setCameraResetVersion((current) => current + 1)
    experience.resetState()
    resetMapCamera(mapRef.current)
  }, [experience, mapRef])

  return {
    provenances,
    filteredProvenances,
    visibleFindspotCount,
    mapContainer,
    drawerRef,
    mapRef,
    isBackgroundUnavailable,
    isExcavationAreasUnavailable,
    experience,
    panel,
    canShowExcavationAreas,
    showExcavationAreas,
    fragmentMapData,
    selectedPolygon: findPolygon(polygonIndex, selectedPolygonId),
    resetView,
  }
}
