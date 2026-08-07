import React from 'react'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { HistoricalMapOverlay } from './historicalOverlays'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import { matchSiteCapabilities } from './provenanceSiteMatch'
import type { MapSelection } from './mapSelection'
import type {
  PolygonResearchSummary,
  SiteResearchSummary,
} from './mapResearchSummary'
import type { MapResearchContext } from './mapResearchSummaryText'
import MapInspectorArea from './MapInspectorArea'
import MapInspectorExplorer from './MapInspectorExplorer'
import MapInspectorSite from './MapInspectorSite'
import { InspectorBackButton } from './MapInspectorParts'

export interface MapInspectorProps {
  readonly capabilities: readonly MapSiteCapabilities[]
  readonly filteredProvenances: readonly ProvenanceRecord[]
  readonly mappedFindspotCount: number
  readonly linkedExcavationAreaCount: number
  readonly provenances: readonly ProvenanceRecord[]
  readonly selectedPolygonSite: MapSiteCapabilities | undefined
  readonly selectedPolygonSummary: PolygonResearchSummary | null
  readonly selectedSiteSummary: SiteResearchSummary | undefined
  readonly selection: MapSelection | null
  readonly showExcavationAreas: boolean
  readonly siteOverlays: readonly HistoricalMapOverlay[]
  readonly activeOverlayIds: ReadonlySet<string>
  readonly buildResearchContext: () => MapResearchContext
  readonly onBrowseHistoricalMaps: (siteName: string) => void
  readonly onClearSelection: () => void
  readonly onCompareHistoricalMaps: () => void
  readonly onSelectSite: (provenanceId: string) => void
  readonly onShowExcavationAreas: () => void
  readonly onToggleOverlay: (
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ) => void
}

function SelectedShell({
  children,
  onClearSelection,
}: {
  readonly children: React.ReactNode
  readonly onClearSelection: () => void
}): JSX.Element {
  return (
    <aside className="map-inspector map-inspector--selected" aria-live="polite">
      <InspectorBackButton onClick={onClearSelection} />
      {children}
    </aside>
  )
}

export default function MapInspector(props: MapInspectorProps): JSX.Element {
  const { selection, selectedPolygonSummary } = props

  if (selection?.type === 'excavation-area' && selectedPolygonSummary) {
    return (
      <SelectedShell onClearSelection={props.onClearSelection}>
        <MapInspectorArea
          summary={selectedPolygonSummary}
          overlays={props.siteOverlays}
          activeOverlayIds={props.activeOverlayIds}
          buildResearchContext={props.buildResearchContext}
          onToggleOverlay={props.onToggleOverlay}
          onCompareHistoricalMaps={props.onCompareHistoricalMaps}
        />
      </SelectedShell>
    )
  }

  if (selection?.type === 'site') {
    const provenance = props.provenances.find(
      (entry) => entry.id === selection.provenanceId,
    )

    return (
      <SelectedShell onClearSelection={props.onClearSelection}>
        <MapInspectorSite
          provenance={provenance}
          site={matchSiteCapabilities(provenance, props.capabilities)}
          siteSummary={props.selectedSiteSummary}
          showExcavationAreas={props.showExcavationAreas}
          buildResearchContext={props.buildResearchContext}
          onBrowseHistoricalMaps={props.onBrowseHistoricalMaps}
          onShowExcavationAreas={props.onShowExcavationAreas}
        />
      </SelectedShell>
    )
  }

  return (
    <MapInspectorExplorer
      capabilities={props.capabilities}
      filteredProvenances={props.filteredProvenances}
      linkedExcavationAreaCount={props.linkedExcavationAreaCount}
      mappedFindspotCount={props.mappedFindspotCount}
      selectedProvenanceId={null}
      onSelectSite={props.onSelectSite}
    />
  )
}
