import React from 'react'
import { Button } from 'react-bootstrap'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { MapSiteCapabilities } from 'map/mapSiteCapabilities'
import { isLinkedDataLoaded } from 'map/mapSiteCapabilities'
import type { SiteResearchSummary } from 'map/mapResearchSummary'
import {
  LINKED_POLYGON_LABEL,
  linkedPolygonSentence,
} from 'map/mapResearchLabels'
import type { MapResearchContext } from 'map/mapResearchSummaryText'
import { siteResearchMarkdown } from 'map/mapResearchSummaryText'
import { InspectorMetric, LinkedDataUnavailable } from 'map/MapInspectorParts'
import MapCompletenessNote from 'map/MapCompletenessNote'
import MapResearchSummaryActions from 'map/MapResearchSummaryActions'

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
        label="Accessible tablets"
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
  const hasLoadedData = isLinkedDataLoaded(site)
  return (
    <>
      <div className="map-inspector__eyebrow">Site</div>
      <h2>{provenance?.longName ?? 'Selected site'}</h2>
      {provenance?.parent ? <p>{provenance.parent}</p> : null}
      {siteSummary && hasLoadedData ? (
        <CoverageMetrics summary={siteSummary} />
      ) : null}
      {!hasLoadedData ? <LinkedDataUnavailable site={site} /> : null}
      {siteSummary && hasLoadedData ? (
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
