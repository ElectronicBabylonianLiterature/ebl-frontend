import type { RefObject } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { ActiveMapPanel } from './mapPanel'
import type { MapExperience } from './useMapExperience'
import type { MapResearch } from './useMapResearch'
import type { MapVisualization } from './useMapVisualization'
import type { ExtrusionScale } from './mapExtrusionScale'
import type { ActiveOverlayEntry } from './historicalOverlayActions'
import type { MapHoverPreview, MapSelection } from './mapSelection'
import type { MapSiteData } from './useMapSiteData'
import type { MapCameraState } from './mapUrlState'
import useFindspotMap from './useFindspotMap'
import useMapSourceData from './useMapSourceData'
import useMapCamera from './useMapCamera'
import useMapTerrain, { type MapTerrainResult } from './useMapTerrain'
import useMapLayoutEffects from './useMapLayoutEffects'

export interface MapInstanceInput {
  readonly mapContainer: RefObject<HTMLDivElement>
  readonly drawerRef: RefObject<HTMLElement>
  readonly siteData: MapSiteData
  readonly experience: MapExperience
  readonly research: MapResearch
  readonly visualization: MapVisualization
  readonly extrusionScale: ExtrusionScale | null
  readonly filteredProvenances: readonly ProvenanceRecord[] | null
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly activePanel: ActiveMapPanel
  readonly onSelectFeature: (selection: MapSelection) => void
  readonly onHoverPreview: (preview: MapHoverPreview | null) => void
  readonly onBaseStyleFailure: () => void
}

export interface MapInstance {
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly camera: MapCameraState
  readonly terrain: MapTerrainResult
}

/**
 * Creates and feeds the single MapLibre instance. Terrain exaggeration and
 * hillshade visibility are passed through here rather than owned separately,
 * so the 3D controls drive the existing terrain lifecycle instead of a second
 * one, and changing a 3D setting never recreates the map.
 */
export default function useMapInstance(input: MapInstanceInput): MapInstance {
  const { experience, siteData, visualization, research } = input

  const mapRef = useFindspotMap(input.mapContainer, {
    provenances: input.filteredProvenances,
    showBoundaries: experience.showBoundaries,
    activeHistoricalOverlays: input.activeOverlayEntries,
    showExcavationAreas: experience.showExcavationAreas,
    polygonSummaries: siteData.polygonSummaries,
    polygonVisualizationValues: visualization.values,
    excavationPaint: visualization.paint,
    extrusionScale: input.extrusionScale,
    isExtrusionEnabled: experience.tools.threeD.isExtrusionEnabled,
    siteSummaries: research.siteSummaries,
    siteMarkerStates: research.markerStates,
    selection: experience.selection,
    onSelectFeature: input.onSelectFeature,
    onHoverPreview: input.onHoverPreview,
    onBaseStyleFailure: input.onBaseStyleFailure,
  })

  useMapSourceData(mapRef, input.filteredProvenances)
  const camera = useMapCamera(mapRef, siteData.provenances !== null)
  const terrain = useMapTerrain(mapRef, experience.tools.terrain, {
    exaggeration: experience.tools.threeD.terrainExaggeration,
    isHillshadeVisible: experience.tools.threeD.hillshadeVisible,
  })
  useMapLayoutEffects(
    input.mapContainer,
    mapRef,
    input.drawerRef,
    input.activePanel,
  )

  return { mapRef, camera, terrain }
}
