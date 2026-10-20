import {
  isLinkedDataLoaded,
  type MapSiteCapabilities,
} from 'map/mapSiteCapabilities'
import React from 'react'
import type { HistoricalMapOverlay } from 'map/historicalOverlays'
import type { PolygonResearchSummary } from 'map/mapResearchSummary'
import {
  countLabel,
  locationPrecisionLabel,
  mappingEvidenceShortLabel,
} from 'map/mapResearchLabels'
import type { MapResearchContext } from 'map/mapResearchSummaryText'
import { polygonResearchMarkdown } from 'map/mapResearchSummaryText'
import {
  FindspotRows,
  LinkedDataUnavailable,
  InspectorBadge,
  InspectorMetric,
} from 'map/MapInspectorParts'
import MapInspectorEvidence from 'map/MapInspectorEvidence'
import MapInspectorMaps from 'map/MapInspectorMaps'
import MapInspectorTabs from 'map/MapInspectorTabs'
import MapCompletenessNote from 'map/MapCompletenessNote'
import MapResearchSummaryActions from 'map/MapResearchSummaryActions'

export interface MapInspectorAreaProps {
  readonly summary: PolygonResearchSummary
  readonly site: MapSiteCapabilities | undefined
  readonly overlays: readonly HistoricalMapOverlay[]
  readonly activeOverlayIds: ReadonlySet<string>
  readonly buildResearchContext: () => MapResearchContext
  readonly onToggleOverlay: (
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ) => void
  readonly onCompareHistoricalMaps: () => void
}

function Overview({
  summary,
}: {
  readonly summary: PolygonResearchSummary
}): JSX.Element {
  return (
    <div className="map-inspector__overview">
      <div className="map-inspector__badges">
        <InspectorBadge
          label={mappingEvidenceShortLabel(summary.mappingEvidence)}
          tone={summary.mappingEvidence}
        />
        <InspectorBadge
          label={locationPrecisionLabel(summary.locationPrecision)}
          tone="precision"
        />
      </div>
      <div className="map-inspector__metrics">
        <InspectorMetric
          label="Mapped findspots"
          value={summary.mappedFindspotCount}
        />
        <InspectorMetric
          label="Accessible tablets"
          value={summary.accessibleFragmentCount}
        />
      </div>
      <MapCompletenessNote />
    </div>
  )
}

export default function MapInspectorArea({
  summary,
  site,
  overlays,
  activeOverlayIds,
  buildResearchContext,
  onToggleOverlay,
  onCompareHistoricalMaps,
}: MapInspectorAreaProps): JSX.Element {
  const hasLoadedData = isLinkedDataLoaded(site)
  return (
    <>
      <div className="map-inspector__eyebrow">
        Excavation area · {summary.siteName}
      </div>
      <h2>{summary.displayName}</h2>
      {hasLoadedData ? (
        <MapResearchSummaryActions
          title={`${summary.displayName} ${summary.siteName}`}
          buildSummary={() => {
            const context = buildResearchContext()
            return {
              markdown: polygonResearchMarkdown(summary, context),
              generatedAt: context.generatedAt,
            }
          }}
        />
      ) : null}
      <MapInspectorTabs
        label="Excavation area sections"
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            render: () =>
              hasLoadedData ? (
                <Overview summary={summary} />
              ) : (
                <LinkedDataUnavailable site={site} />
              ),
          },
          {
            id: 'evidence',
            label: 'Evidence',
            render: () =>
              hasLoadedData ? (
                <MapInspectorEvidence summary={summary} />
              ) : (
                <LinkedDataUnavailable site={site} />
              ),
          },
          {
            id: 'findspots',
            label: 'Findspots',
            render: () =>
              !hasLoadedData ? (
                <LinkedDataUnavailable site={site} />
              ) : summary.findspots.length === 0 ? (
                <p>No mapped findspots are linked to this excavation area.</p>
              ) : (
                <>
                  <p className="map-inspector__findspots-heading">
                    {countLabel(summary.mappedFindspotCount, 'mapped findspot')}
                  </p>
                  <FindspotRows findspots={summary.findspots} />
                </>
              ),
          },
          {
            id: 'maps',
            label: 'Maps',
            render: () => (
              <MapInspectorMaps
                siteName={summary.siteName}
                overlays={overlays}
                activeOverlayIds={activeOverlayIds}
                onToggleOverlay={onToggleOverlay}
                onCompare={onCompareHistoricalMaps}
              />
            ),
          },
        ]}
      />
    </>
  )
}
