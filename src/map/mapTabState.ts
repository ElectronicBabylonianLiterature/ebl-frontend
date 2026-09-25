import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import type { MapExperience } from 'map/useMapExperience'
import type { MapExportView } from 'map/useMapExportView'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import type { MeasurementController } from 'map/useMapMeasurement'
import type { MapPanelController } from 'map/useMapPanel'
import type { SpatialSearchController } from 'map/useMapSpatialSearch'
import type { MapTerrainResult } from 'map/useMapTerrain'
import type { MapVisualization } from 'map/useMapVisualization'

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
  readonly visualization: MapVisualization
  readonly measurement: MeasurementController
  readonly spatialSearch: SpatialSearchController
  readonly exportView: MapExportView
  readonly terrain: MapTerrainResult
  readonly excavationPolygons: readonly ExcavationPolygon[]
  readonly selectPolygon: (polygonId: string) => void
  readonly resetView: () => void
}
