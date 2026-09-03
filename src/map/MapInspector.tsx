import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MapInspectorTabs, { type InspectorTab } from 'map/MapInspectorTabs'
import MapCompletenessNote from 'map/MapCompletenessNote'
import MapResearchSummaryActions from 'map/MapResearchSummaryActions'
import { polygonResearchMarkdown } from 'map/mapResearchSummaryText'
import { visualizationModeLabel } from 'map/MapVisualizationControl'
import type { MapVisualizationMode } from 'map/mapChoroplethScale'
import { buildFindspotFragmentSearchLink } from 'map/mapLinks'
import {
  locationPrecisionLabel,
  mappingEvidenceLabel,
  countLabel,
} from 'map/mapResearchLabels'
import {
  derivePolygonResearchSummary,
  type PolygonResearchSummary,
} from 'map/mapResearchSummary'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { FragmentMapDataStatus } from 'map/useFragmentMapData'

interface Props {
  readonly polygon: ExcavationPolygon
  readonly summary: PolygonFindspotSummary | undefined
  readonly siteName: string
  readonly status: FragmentMapDataStatus
  readonly visualizationMode: MapVisualizationMode
  readonly siteFilter: string
  readonly onClear: () => void
}

function OverviewTab({
  research,
}: {
  research: PolygonResearchSummary
}): JSX.Element {
  return (
    <dl className="map-inspector__facts">
      <dt>Site</dt>
      <dd>{research.siteName}</dd>
      <dt>Excavation area</dt>
      <dd>{research.displayName}</dd>
      {research.areaSquareKm !== null ? (
        <>
          <dt>Mapped area</dt>
          <dd>{research.areaSquareKm.toFixed(3)} km²</dd>
        </>
      ) : null}
      <dt>Mapped findspots</dt>
      <dd>{countLabel(research.mappedFindspotCount, 'findspot')}</dd>
      <dt>Accessible fragments</dt>
      <dd>{countLabel(research.accessibleFragmentCount, 'fragment')}</dd>
    </dl>
  )
}

function EvidenceTab({
  research,
  status,
}: {
  research: PolygonResearchSummary
  status: FragmentMapDataStatus
}): JSX.Element {
  if (status !== 'loaded') {
    return <p>Evidence detail needs linked fragment data for this site.</p>
  }
  return (
    <>
      <dl className="map-inspector__facts">
        <dt>Mapping evidence</dt>
        <dd>{mappingEvidenceLabel(research.mappingEvidence)}</dd>
        <dt>Location precision</dt>
        <dd>{locationPrecisionLabel(research.locationPrecision)}</dd>
      </dl>
      <MapCompletenessNote />
    </>
  )
}

function FindspotsTab({
  research,
  expandedCount,
  onExpand,
}: {
  research: PolygonResearchSummary
  expandedCount: number
  onExpand: () => void
}): JSX.Element {
  if (research.findspots.length === 0) {
    return <p>No fragments are linked to this excavation area.</p>
  }
  const visible = research.findspots.slice(0, expandedCount)
  return (
    <>
      <ul className="map-inspector__findspots">
        {visible.map((findspot) => (
          <li key={findspot.findspotId}>
            <Link to={buildFindspotFragmentSearchLink(findspot.findspotId)}>
              {findspot.area ?? `Findspot ${findspot.findspotId}`}
            </Link>{' '}
            ({countLabel(findspot.accessibleFragmentCount, 'fragment')})
          </li>
        ))}
      </ul>
      {expandedCount < research.findspots.length ? (
        <button type="button" onClick={onExpand}>
          Show all {research.findspots.length}
        </button>
      ) : null}
    </>
  )
}

export default function MapInspector({
  polygon,
  summary,
  siteName,
  status,
  visualizationMode,
  siteFilter,
  onClear,
}: Props): JSX.Element {
  const [expandedCount, setExpandedCount] = useState(10)
  const research = derivePolygonResearchSummary({
    polygonId: polygon.polygonId,
    polygon,
    summary,
    siteName,
  })

  const tabs: readonly InspectorTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      render: () => <OverviewTab research={research} />,
    },
    {
      id: 'evidence',
      label: 'Evidence',
      render: () => <EvidenceTab research={research} status={status} />,
    },
    {
      id: 'findspots',
      label: 'Findspots',
      render: () => (
        <FindspotsTab
          research={research}
          expandedCount={expandedCount}
          onExpand={() => setExpandedCount(research.findspots.length)}
        />
      ),
    },
  ]

  return (
    <div className="map-inspector">
      <header className="map-inspector__header">
        <strong>{research.displayName}</strong>
        <button type="button" onClick={onClear}>
          Clear selection
        </button>
      </header>
      <MapInspectorTabs tabs={tabs} label="Excavation area detail" />
      <MapResearchSummaryActions
        title={`${research.displayName} — ${research.siteName}`}
        buildSummary={() => {
          const generatedAt = new Date().toISOString()
          return {
            generatedAt,
            markdown: polygonResearchMarkdown(research, {
              visualizationLabel: visualizationModeLabel(visualizationMode),
              siteFilter,
              shareUrl: window.location.href,
              generatedAt,
            }),
          }
        }}
      />
    </div>
  )
}
