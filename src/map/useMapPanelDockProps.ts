import { useMemo } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { MapSiteData } from './useMapSiteData'
import type { MapExperience } from './useMapExperience'
import type { HistoricalMapPanel } from './useHistoricalMapPanel'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import type { MapTerrainResult } from './useMapTerrain'
import type { ActiveOverlayEntry } from './historicalOverlayActions'
import type { HistoricalMapOverlay } from './historicalOverlays'
import type { MapVisualization } from './useMapVisualization'
import type { MapResearch } from './useMapResearch'
import type { Map3dPanelProps } from './Map3dPanel'
import type { MapResearchContext } from './mapResearchSummaryText'
import type { InfoPanelsInput } from './mapInfoPanels'
import type { ToolPanelsInput } from './mapToolPanels'

export interface MapPanelDockPropsInput {
  readonly siteData: MapSiteData
  readonly experience: MapExperience
  readonly historicalMapPanel: HistoricalMapPanel
  readonly capabilities: readonly MapSiteCapabilities[]
  readonly selectedPolygonSite: MapSiteCapabilities | undefined
  readonly filteredProvenances: readonly ProvenanceRecord[] | null
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly availableOverlays: readonly HistoricalMapOverlay[]
  readonly siteOverlays: readonly HistoricalMapOverlay[]
  readonly visualization: MapVisualization
  readonly research: MapResearch
  readonly terrain: MapTerrainResult
  readonly map: MapLibreMap | null
  readonly threeD: Map3dPanelProps
  readonly buildResearchContext: () => MapResearchContext
  readonly onBrowseHistoricalMaps: (siteName: string) => void
  readonly onCompareHistoricalMaps: () => void
  readonly onSelectSite: (provenanceId: string) => void
  readonly onClearSelection: () => void
}

export interface MapPanelDockPropGroups {
  readonly info: InfoPanelsInput
  readonly tools: Omit<
    ToolPanelsInput,
    'interactions' | 'excavationPolygonIndex' | 'polygonSummaries' | 'elevation'
  >
}

/**
 * Assembles the (large) prop bags `MapPanelDock` needs for its nine panels
 * from the pieces `MapTab` already computes, memoized so opening or closing
 * a panel does not recreate every other panel's props.
 */
export default function useMapPanelDockProps(
  input: MapPanelDockPropsInput,
): MapPanelDockPropGroups {
  const {
    siteData,
    experience,
    historicalMapPanel,
    capabilities,
    selectedPolygonSite,
    filteredProvenances,
    activeOverlayEntries,
    availableOverlays,
    siteOverlays,
    visualization,
    research,
    terrain,
    map,
    threeD,
    buildResearchContext,
    onBrowseHistoricalMaps,
    onCompareHistoricalMaps,
    onSelectSite,
    onClearSelection,
  } = input

  const activeOverlayIds = useMemo(
    () => new Set(experience.activeOverlays.map((entry) => entry.id)),
    [experience.activeOverlays],
  )

  const info = useMemo<InfoPanelsInput>(
    () => ({
      inspector: {
        capabilities,
        filteredProvenances: filteredProvenances ?? [],
        mappedFindspotCount: siteData.fragmentMapData.length,
        linkedExcavationAreaCount: siteData.polygonSummaries.size,
        provenances: siteData.provenances ?? [],
        selectedPolygonSite,
        selectedPolygonSummary: research.selectedPolygonSummary,
        selectedSiteSummary: research.selectedSiteSummary,
        selection: experience.selection,
        showExcavationAreas: experience.showExcavationAreas,
        siteOverlays,
        activeOverlayIds,
        buildResearchContext,
        onBrowseHistoricalMaps,
        onClearSelection,
        onCompareHistoricalMaps,
        onSelectSite,
        onShowExcavationAreas: () => experience.setShowExcavationAreas(true),
        onToggleOverlay: experience.setOverlayActive,
      },
      experience,
      historicalMapPanel,
      activeOverlayEntries,
      linkedExcavationAreaCount: siteData.polygonSummaries.size,
      map,
      isDensityAvailable: visualization.isDensityAvailable,
      legend: visualization.legend,
      visualizationMode: visualization.effectiveMode,
      onVisualizationModeChange: experience.setVisualization,
    }),
    [
      activeOverlayEntries,
      activeOverlayIds,
      buildResearchContext,
      capabilities,
      filteredProvenances,
      siteData,
      siteOverlays,
      selectedPolygonSite,
      research,
      experience,
      onBrowseHistoricalMaps,
      onClearSelection,
      onCompareHistoricalMaps,
      onSelectSite,
      historicalMapPanel,
      map,
      visualization,
    ],
  )

  const tools = useMemo<MapPanelDockPropGroups['tools']>(
    () => ({
      tools: experience.tools,
      terrain,
      overlays: availableOverlays,
      activeOverlays: activeOverlayEntries.map((entry) => entry.overlay),
      visualization: visualization.effectiveMode,
      siteFilter: experience.siteFilter,
      threeD,
    }),
    [
      experience,
      terrain,
      availableOverlays,
      activeOverlayEntries,
      visualization,
      threeD,
    ],
  )

  return { info, tools }
}
