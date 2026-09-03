import React from 'react'
import { Button } from 'react-bootstrap'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import { fragmentDataStatusText } from './mapSiteCapabilities'
import type { SiteResearchSummary } from './mapResearchSummary'
import {
  LINKED_POLYGON_LABEL,
  linkedPolygonSentence,
} from './mapResearchLabels'
import type { MapResearchContext } from './mapResearchSummaryText'
import { siteResearchMarkdown } from './mapResearchSummaryText'
import { InspectorMetric } from './MapInspectorParts'
import MapCompletenessNote from './MapCompletenessNote'
import MapResearchSummaryActions from './MapResearchSummaryActions'

interface Props {
  readonly provenance: ProvenanceRecord | undefined
  readonly site: MapSiteCapabilities | undefined
  readonly siteSummary: SiteResearchSummary | undefined
  readonly showExcavationAreas: boolean
  readonly buildResearchContext: () => MapResearchContext
  readonly onBrowseHistoricalMaps: (siteName: string) => void
  readonly onShowExcavationAreas: () => void
}

/**
 * The site-level coverage summary. Only one ratio is ever shown, and it is
 * labelled for exactly what it counts — linked excavation polygons — so it
 * can never be read as corpus or findspot coverage.
 */
function CoverageMetrics({
  summary,
}: {
  readonly summary: SiteResearchSummary
}): JSX.Element {
  return (
    <div className="map-inspector__metrics">
      <InspectorMetric
        label={LINKED_POLYGON_LABEL}
        value={linkedPolygonSentence(
          summary.linkedPolygonCount,
          summary.totalPolygonCount,
        )}
      />
      <InspectorMetric
        label="Mapped findspots"
        value={summary.mappedFindspotCount}
      />
      <InspectorMetric
        label="Accessible fragments"
        value={summary.accessibleFragmentCount}
      />
      <InspectorMetric
        label="Historical maps available"
        value={summary.historicalOverlayCount}
      />
    </div>
  )
}

export default function MapInspectorSite({
  provenance,
  site,
  siteSummary,
  showExcavationAreas,
  buildResearchContext,
  onBrowseHistoricalMaps,
  onShowExcavationAreas,
}: Props): JSX.Element {
  return (
    <>
      <div className="map-inspector__eyebrow">Site</div>
      <h2>{provenance?.longName ?? 'Selected site'}</h2>
      {provenance?.parent ? <p>{provenance.parent}</p> : null}
      {siteSummary ? <CoverageMetrics summary={siteSummary} /> : null}
      {site && !site.hasFragmentMapData ? (
        <p className="map-inspector__unsupported">
          {fragmentDataStatusText(site)}
        </p>
      ) : null}
      {siteSummary ? (
        <MapResearchSummaryActions
          title={siteSummary.siteName}
          buildSummary={() => {
            const context = buildResearchContext()
            return {
              markdown: siteResearchMarkdown(siteSummary, context),
              generatedAt: context.generatedAt,
            }
          }}
        />
      ) : null}
      <div className="map-inspector__actions">
        {site?.hasExcavationPolygons ? (
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            onClick={onShowExcavationAreas}
          >
            {showExcavationAreas
              ? 'Excavation areas visible'
              : 'Show excavation areas'}
          </Button>
        ) : null}
        {provenance && site?.hasHistoricalMaps ? (
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={() => onBrowseHistoricalMaps(provenance.longName)}
          >
            Open historical maps
          </Button>
        ) : null}
      </div>
      <MapCompletenessNote />
    </>
  )
}
