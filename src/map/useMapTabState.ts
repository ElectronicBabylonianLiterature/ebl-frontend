import { useCallback, useMemo, useRef, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import useProvenances from 'map/useProvenances'
import useFindspotMap from 'map/useFindspotMap'
import useMapSourceData from 'map/useMapSourceData'
import useExcavationAreas from 'map/useExcavationAreas'
import useExcavationPolygonIndex from 'map/useExcavationPolygonIndex'
import useFragmentMapData, {
  type FragmentMapDataState,
} from 'map/useFragmentMapData'
import useMapExperience, { type MapExperience } from 'map/useMapExperience'
import useMapPanel, { type MapPanelController } from 'map/useMapPanel'
import useMapVisualization, {
  type MapVisualization,
} from 'map/useMapVisualization'
import useMapMeasurement, {
  type MeasurementController,
} from 'map/useMapMeasurement'
import useMapSpatialSearch, {
  type SpatialSearchController,
} from 'map/useMapSpatialSearch'
import useMapLayoutEffects from 'map/useMapLayoutEffects'
import { resetMapCamera } from 'map/mapCamera'
import { filterProvenances } from 'map/findspotFilter'
import {
  anySiteHasExcavationPolygons,
  deriveMapSiteCapabilities,
} from 'map/mapSiteCapabilities'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'

export interface MapTabState {
  readonly provenances: readonly ProvenanceRecord[] | null
  readonly provenanceError: string | null
  readonly filteredProvenances: readonly ProvenanceRecord[] | null
  readonly mapContainer: RefObject<HTMLDivElement>
  readonly drawerRef: RefObject<HTMLElement>
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly isBackgroundUnavailable: boolean
  readonly experience: MapExperience
  readonly panel: MapPanelController
  readonly canShowExcavationAreas: boolean
  readonly showExcavationAreas: boolean
  readonly fragmentMapData: FragmentMapDataState
  readonly selectedPolygon: ExcavationPolygon | null
  readonly visualization: MapVisualization
  readonly measurement: MeasurementController
  readonly spatialSearch: SpatialSearchController
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
  fragmentService: FragmentService,
): MapTabState {
  const mapContainer = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const [isBackgroundUnavailable, setIsBackgroundUnavailable] = useState(false)

  const { provenances, error: provenanceError } = useProvenances(fragmentService)
  const experience = useMapExperience()
  const panel = useMapPanel()
  const { index: polygonIndex } = useExcavationPolygonIndex()
  const fragmentMapData = useFragmentMapData(findspotService)

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

  const onMapBackgroundError = useCallback(
    (hasError: boolean) => setIsBackgroundUnavailable(hasError),
    [],
  )
  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    onMapBackgroundError,
  )
  useMapSourceData(mapRef, filteredProvenances)

  const visualization = useMapVisualization(
    fragmentMapData.polygonSummaries,
    polygonIndex,
    experience.visualization,
  )

  const { setSelection } = experience
  const { open: openPanel } = panel
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

  useExcavationAreas(mapRef, {
    isVisible: showExcavationAreas,
    selectedPolygonId,
    paint: visualization.paint,
    onSelectPolygon,
  })
  useMapLayoutEffects(mapContainer, mapRef, drawerRef, panel.active)

  const measurement = useMapMeasurement(
    mapRef,
    panel.active === 'measurement',
  )
  const spatialSearch = useMapSpatialSearch(
    mapRef,
    panel.active === 'spatial-search',
    polygonIndex,
    fragmentMapData.polygonSummaries,
  )

  const resetView = useCallback(() => {
    experience.resetState()
    resetMapCamera(mapRef.current)
  }, [experience, mapRef])

  return {
    provenances,
    provenanceError,
    filteredProvenances,
    mapContainer,
    drawerRef,
    mapRef,
    isBackgroundUnavailable,
    experience,
    panel,
    canShowExcavationAreas,
    showExcavationAreas,
    fragmentMapData,
    selectedPolygon: findPolygon(polygonIndex, selectedPolygonId),
    visualization,
    measurement,
    spatialSearch,
    resetView,
  }
}
