import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { ExcavationPolygon } from 'map/domain/excavationPolygonIndex'
import type { MapExperience } from 'map/ui/useMapExperience'
import type { MapExportView } from 'map/ui/useMapExportView'
import type { FragmentMapDataState } from 'map/domain/useFragmentMapData'
import type { MeasurementController } from 'map/ui/useMapMeasurement'
import type { MapPanelController } from 'map/ui/useMapPanel'
import type { SpatialSearchController } from 'map/ui/useMapSpatialSearch'
import type { MapTerrainResult } from 'map/maplibre/useMapTerrain'
import type { MapVisualization } from 'map/ui/useMapVisualization'

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
  readonly terrain: MapTerrainResult
  readonly excavationPolygons: readonly ExcavationPolygon[]
  readonly resetView: () => void
}
