import React from 'react'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { MapSiteCapabilities } from './mapSiteCapabilities'
import { fragmentDataStatusText } from './mapSiteCapabilities'
import { matchSiteCapabilities } from './provenanceSiteMatch'
import { InspectorMetric } from './MapInspectorParts'

const EXPLORER_SITE_LIMIT = 8

interface Props {
  readonly capabilities: readonly MapSiteCapabilities[]
  readonly filteredProvenances: readonly ProvenanceRecord[]
  readonly linkedExcavationAreaCount: number
  readonly mappedFindspotCount: number
  readonly selectedProvenanceId: string | null
  readonly onSelectSite: (provenanceId: string) => void
}

function siteSummaryLabel(site: MapSiteCapabilities | undefined): string {
  if (!site) return 'Site'
  if (site.hasFragmentMapData) return 'Fragment-linked areas'
  if (site.hasExcavationPolygons) return 'Excavation areas'
  return site.hasHistoricalMaps ? 'Historical maps' : 'Site'
}

export default function MapInspectorExplorer({
  capabilities,
  filteredProvenances,
  linkedExcavationAreaCount,
  mappedFindspotCount,
  selectedProvenanceId,
  onSelectSite,
}: Props): JSX.Element {
  return (
    <aside className="map-inspector" aria-label="Map explorer">
      <div className="map-inspector__eyebrow">Digital archaeological atlas</div>
      <h2>Explore the ancient world</h2>
      <p>Browse sites, excavation areas, and linked fragments.</p>
      <div className="map-inspector__metrics">
        <InspectorMetric
          label="Visible provenances"
          value={filteredProvenances.length}
        />
        <InspectorMetric label="Mapped findspots" value={mappedFindspotCount} />
        <InspectorMetric
          label="Linked excavation areas"
          value={linkedExcavationAreaCount}
        />
      </div>
      <ul
        className="map-inspector__site-support"
        aria-label="Site data support"
      >
        {capabilities.map((site) => (
          <li key={site.siteId}>
            <strong>{site.siteName}</strong>
            <span>{fragmentDataStatusText(site)}</span>
          </li>
        ))}
      </ul>
      <div className="map-inspector__site-list" aria-label="Visible sites">
        {filteredProvenances.slice(0, EXPLORER_SITE_LIMIT).map((provenance) => (
          <button
            key={provenance.id}
            type="button"
            className="map-inspector__site-card"
            aria-pressed={provenance.id === selectedProvenanceId}
            onClick={() => onSelectSite(provenance.id)}
          >
            <span>
              <strong>{provenance.longName}</strong>
              {provenance.parent ? <small>{provenance.parent}</small> : null}
            </span>
            <span>
              {siteSummaryLabel(
                matchSiteCapabilities(provenance, capabilities),
              )}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
