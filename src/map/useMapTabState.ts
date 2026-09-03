import { useCallback, useMemo, useRef, useState } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { validatedHistoricalMapOverlays } from './historicalOverlays'
import type { MapHoverPreview } from './mapSelection'
import useHistoricalMapPanel from './useHistoricalMapPanel'
import useMapExperience, { type MapExperience } from './useMapExperience'
import useMapPanel, { type MapPanelController } from './useMapPanel'
import useMapSiteData, { type MapSiteData } from './useMapSiteData'
import useMapUrlPersistence from './useMapUrlPersistence'
import useMapCapabilities from './useMapCapabilities'
import useMapVisualization, {
  type MapVisualization,
} from './useMapVisualization'
import useMapResearch, { type MapResearch } from './useMapResearch'
import {
  useMapResearchContext,
  useSelectedSiteOverlays,
} from './useMapResearchContext'
import useMapInstance from './useMapInstance'
import useMap3d, { type Map3d, useExtrusionScale } from './useMap3d'
import useTimelineOverlays from './useTimelineOverlays'
import useMapPanelDockProps, {
  type MapPanelDockPropGroups,
} from './useMapPanelDockProps'
import useMapSelectionActions from './useMapSelectionActions'
import usePresentationMode, {
  type PresentationMode,
} from './usePresentationMode'
import { focusProvenance, resetCamera } from './mapCamera'
import { activeOverlayEntries as toActiveOverlayEntries } from './historicalOverlayActions'

export interface MapTabState extends MapPanelDockPropGroups {
  readonly mapContainer: RefObject<HTMLDivElement>
  readonly drawerRef: RefObject<HTMLElement>
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly siteData: MapSiteData
  readonly experience: MapExperience
  readonly mapPanel: MapPanelController
  readonly presentation: PresentationMode
  readonly visualization: MapVisualization
  readonly research: MapResearch
  readonly threeD: Map3d
  readonly filteredProvenances: readonly ProvenanceRecord[] | null
  readonly hoverPreview: MapHoverPreview | null
  readonly isBackgroundUnavailable: boolean
  readonly dismissSelection: () => void
  readonly resetView: () => void
}

function filterProvenances(
  provenances: readonly ProvenanceRecord[] | null,
  filter: string,
): readonly ProvenanceRecord[] | null {
  if (!provenances) return null

  const normalizedFilter = filter.trim().toLowerCase()
  return normalizedFilter
    ? provenances.filter((provenance) =>
        provenance.longName.toLowerCase().includes(normalizedFilter),
      )
    : provenances
}

/**
 * All of the map route's state composition in one place, so `MapTab` itself
 * is only layout. Nothing here fetches per selection, per visualization mode
 * or per inspector tab — the fetches live in `useMapSiteData` alone.
 */
export default function useMapTabState(
  findspotService: FindspotService,
  fragmentService: FragmentService,
): MapTabState {
  const mapContainer = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const [hoverPreview, setHoverPreview] = useState<MapHoverPreview | null>(null)
  const [isBackgroundUnavailable, setIsBackgroundUnavailable] = useState(false)

  const siteData = useMapSiteData(findspotService, fragmentService)
  const historicalMapPanel = useHistoricalMapPanel()
  const mapPanel = useMapPanel('inspector')
  const presentation = usePresentationMode()
  const overlayById = useMemo(
    () =>
      new Map(
        validatedHistoricalMapOverlays.map((overlay) => [overlay.id, overlay]),
      ),
    [],
  )
  const urlStateContext = useMemo(
    () => ({ knownOverlayIds: new Set(overlayById.keys()) }),
    [overlayById],
  )
  const experience = useMapExperience(urlStateContext)

  const filteredProvenances = useMemo(
    () => filterProvenances(siteData.provenances, experience.siteFilter),
    [siteData.provenances, experience.siteFilter],
  )
  const timelineOverlays = useTimelineOverlays(
    validatedHistoricalMapOverlays,
    experience.activeOverlays,
    experience.tools.timeline,
    experience.tools.comparison,
  )
  const activeOverlayEntries = useMemo(
    () => toActiveOverlayEntries(timelineOverlays.active, overlayById),
    [timelineOverlays.active, overlayById],
  )
  const { capabilities, selectedPolygonSite } = useMapCapabilities(
    siteData,
    experience.selection,
  )

  const visualization = useMapVisualization(
    siteData.polygonSummaries,
    siteData.excavationPolygonIndex,
    experience.visualization,
  )
  const research = useMapResearch(
    siteData,
    capabilities,
    siteData.provenances ?? [],
    experience.selection,
    selectedPolygonSite,
  )
  const siteOverlays = useSelectedSiteOverlays(
    experience.selection,
    siteData.provenances ?? [],
    capabilities,
    selectedPolygonSite,
  )
  const extrusionScale = useExtrusionScale(
    experience.tools.threeD.extrusionMetric,
    visualization.values,
    experience.tools.threeD.extrusionScale,
  )
  const buildResearchContext = useMapResearchContext({
    activeOverlayEntries,
    isTerrainEnabled: experience.tools.terrain,
    siteFilter: experience.siteFilter,
    visualization: visualization.effectiveMode,
  })

  const {
    selectFeature,
    deselectFeature,
    dismissSelection,
    browseHistoricalMaps,
  } = useMapSelectionActions(
    experience,
    mapPanel,
    historicalMapPanel,
    setHoverPreview,
    presentation.isActive,
  )

  const { mapRef, camera, terrain } = useMapInstance({
    mapContainer,
    drawerRef,
    siteData,
    experience,
    research,
    visualization,
    extrusionScale,
    filteredProvenances,
    activeOverlayEntries,
    activePanel: mapPanel.active,
    onSelectFeature: selectFeature,
    onHoverPreview: setHoverPreview,
    onBaseStyleFailure: () => setIsBackgroundUnavailable(true),
  })

  const threeD = useMap3d({
    mapRef,
    tools: experience.tools,
    visualization,
    terrain,
    excavationPolygonIndex: siteData.excavationPolygonIndex,
    provenances: siteData.provenances ?? [],
    capabilities,
    selection: experience.selection,
    selectedSite: selectedPolygonSite,
    activeOverlayEntries,
    scale: extrusionScale,
  })

  const selectSite = useCallback(
    (provenanceId: string) => {
      selectFeature({ type: 'site', provenanceId })
      focusProvenance(
        mapRef.current,
        siteData.provenances?.find(
          (provenance) => provenance.id === provenanceId,
        ),
      )
    },
    [selectFeature, siteData.provenances, mapRef],
  )
  const { open: openPanel } = mapPanel
  const compareHistoricalMaps = useCallback(
    () => openPanel('comparison'),
    [openPanel],
  )

  const { info, tools } = useMapPanelDockProps({
    siteData,
    experience,
    historicalMapPanel,
    capabilities,
    selectedPolygonSite,
    filteredProvenances,
    activeOverlayEntries,
    availableOverlays: timelineOverlays.available,
    siteOverlays,
    visualization,
    research,
    terrain,
    map: mapRef.current,
    threeD: threeD.panel,
    buildResearchContext,
    onBrowseHistoricalMaps: browseHistoricalMaps,
    onCompareHistoricalMaps: compareHistoricalMaps,
    onSelectSite: selectSite,
    onClearSelection: deselectFeature,
  })

  useMapUrlPersistence(camera, experience, urlStateContext)

  return {
    mapContainer,
    drawerRef,
    mapRef,
    siteData,
    experience,
    mapPanel,
    presentation,
    visualization,
    research,
    threeD,
    filteredProvenances,
    hoverPreview,
    isBackgroundUnavailable,
    dismissSelection,
    resetView: () => {
      experience.reset()
      setHoverPreview(null)
      mapPanel.close()
      resetCamera(mapRef.current)
    },
    info,
    tools,
  }
}
