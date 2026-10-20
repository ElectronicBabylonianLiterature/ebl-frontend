import type { RefObject } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { isInteractivePanel, type ActiveMapPanel } from 'map/mapPanel'
import type { MapExperience } from 'map/useMapExperience'
import type { MapResearch } from 'map/useMapResearch'
import type { MapVisualization } from 'map/useMapVisualization'
import type { ExtrusionScale } from 'map/mapExtrusionScale'
import type { ActiveOverlayEntry } from 'map/historicalOverlayActions'
import type { MapHoverPreview, MapSelection } from 'map/mapSelection'
import type { MapSiteData } from 'map/useMapSiteData'
import type { MapCameraState } from 'map/mapUrlState'
import useFindspotMap from 'map/useFindspotMap'
import useMapSourceData from 'map/useMapSourceData'
import useMapCamera from 'map/useMapCamera'
import useMapTerrain, { type MapTerrainResult } from 'map/useMapTerrain'
import useMapLayoutEffects from 'map/useMapLayoutEffects'

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
  readonly visiblePanel: ActiveMapPanel
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
    requestedCamera: experience.requestedCamera,
    isSelectionEnabled: !isInteractivePanel(input.activePanel),
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
  const camera = useMapCamera(
    mapRef,
    siteData.provenances !== null,
    experience.requestedCamera,
  )
  const terrain = useMapTerrain(mapRef, experience.tools.terrain, {
    exaggeration: experience.tools.threeD.terrainExaggeration,
    isHillshadeVisible: experience.tools.threeD.hillshadeVisible,
  })
  useMapLayoutEffects(
    input.mapContainer,
    mapRef,
    input.drawerRef,
    input.visiblePanel,
    siteData.provenances !== null,
  )

  return { mapRef, camera, terrain }
}
