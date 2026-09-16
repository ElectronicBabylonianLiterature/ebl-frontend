import { useCallback, useMemo } from 'react'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  type HistoricalMapOverlay,
  validatedHistoricalMapOverlays,
} from './historicalOverlays'
import type { ActiveOverlayEntry } from './historicalOverlayActions'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import { matchSiteCapabilities } from './provenanceSiteMatch'
import type { MapSelection } from './mapSelection'
import type { MapVisualizationMode } from './mapChoroplethScale'
import { visualizationModeLabel } from './MapVisualizationControl'
import type { MapResearchContext } from './mapResearchSummaryText'

export interface ResearchContextInput {
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly isTerrainEnabled: boolean
  readonly siteFilter: string
  readonly visualization: MapVisualizationMode
}

/**
 * Builds the summary context lazily, at the moment the reader copies or
 * downloads — so the URL, the timestamp and the active overlays describe the
 * view as it is then, not as it was when the inspector first rendered.
 */
export function useMapResearchContext(
  input: ResearchContextInput,
): () => MapResearchContext {
  const { activeOverlayEntries, isTerrainEnabled, siteFilter, visualization } =
    input

  return useCallback(
    () => ({
      visualizationLabel: visualizationModeLabel(visualization),
      activeOverlayTitles: activeOverlayEntries.map(
        (entry) => entry.overlay.title,
      ),
      isTerrainEnabled,
      siteFilter,
      shareUrl: window.location.href,
      generatedAt: new Date().toISOString(),
    }),
    [activeOverlayEntries, isTerrainEnabled, siteFilter, visualization],
  )
}

function selectedSiteId(
  selection: MapSelection | null,
  provenances: readonly ProvenanceRecord[],
  capabilities: readonly MapSiteCapabilities[],
  selectedPolygonSite: MapSiteCapabilities | undefined,
): string | null {
  if (selection?.type === 'excavation-area') {
    return selectedPolygonSite?.siteId ?? null
  }
  if (selection?.type !== 'site') return null

  const provenance = provenances.find(
    (entry) => entry.id === selection.provenanceId,
  )
  return matchSiteCapabilities(provenance, capabilities)?.siteId ?? null
}

/**
 * The historical sheets that exist for whichever site is selected. The list
 * is memoized on the resolved site id, so re-selecting inside the same site
 * reuses the same array rather than rebuilding it.
 */
export function useSelectedSiteOverlays(
  selection: MapSelection | null,
  provenances: readonly ProvenanceRecord[],
  capabilities: readonly MapSiteCapabilities[],
  selectedPolygonSite: MapSiteCapabilities | undefined,
): readonly HistoricalMapOverlay[] {
  const siteId = selectedSiteId(
    selection,
    provenances,
    capabilities,
    selectedPolygonSite,
  )

  return useMemo(
    () =>
      siteId === null
        ? []
        : validatedHistoricalMapOverlays.filter(
            (overlay) => overlay.siteId === siteId,
          ),
    [siteId],
  )
}
