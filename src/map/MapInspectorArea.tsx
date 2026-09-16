import React from 'react'
import type { HistoricalMapOverlay } from './historicalOverlays'
import type { PolygonResearchSummary } from './mapResearchSummary'
import {
  countLabel,
  locationPrecisionLabel,
  mappingEvidenceShortLabel,
} from './mapResearchLabels'
import type { MapResearchContext } from './mapResearchSummaryText'
import { polygonResearchMarkdown } from './mapResearchSummaryText'
import {
  FindspotRows,
  InspectorBadge,
  InspectorMetric,
} from './MapInspectorParts'
import MapInspectorEvidence from './MapInspectorEvidence'
import MapInspectorMaps from './MapInspectorMaps'
import MapInspectorTabs from './MapInspectorTabs'
import MapCompletenessNote from './MapCompletenessNote'
import MapResearchSummaryActions from './MapResearchSummaryActions'

export interface MapInspectorAreaProps {
  readonly summary: PolygonResearchSummary
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
          label="Accessible fragments"
          value={summary.accessibleFragmentCount}
        />
      </div>
      <MapCompletenessNote />
    </div>
  )
}

export default function MapInspectorArea({
  summary,
  overlays,
  activeOverlayIds,
  buildResearchContext,
  onToggleOverlay,
  onCompareHistoricalMaps,
}: MapInspectorAreaProps): JSX.Element {
  return (
    <>
      <div className="map-inspector__eyebrow">
        Excavation area · {summary.siteName}
      </div>
      <h2>{summary.displayName}</h2>
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
      <MapInspectorTabs
        label="Excavation area sections"
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            render: () => <Overview summary={summary} />,
          },
          {
            id: 'evidence',
            label: 'Evidence',
            render: () => <MapInspectorEvidence summary={summary} />,
          },
          {
            id: 'findspots',
            label: 'Findspots',
            render: () =>
              summary.findspots.length === 0 ? (
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
