import React, { useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type {
  FindspotMapDataStatus,
  PolygonFindspotSummary,
} from './findspotMapData'
import { buildFindspotFragmentSearchLink } from './mapLinks'
import type { MapSelection } from './mapSelection'

interface Props {
  readonly activeHistoricalMapCount: number
  readonly excavationStatusText: string
  readonly filteredProvenances: readonly ProvenanceRecord[]
  readonly historicalMapSiteNames: ReadonlySet<string>
  readonly linkedExcavationAreaCount: number
  readonly mappedFindspotCount: number
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
  readonly provenances: readonly ProvenanceRecord[]
  readonly selection: MapSelection | null
  readonly showExcavationAreas: boolean
  readonly status: FindspotMapDataStatus
  readonly onBrowseHistoricalMaps: (siteName: string) => void
  readonly onClearSelection: () => void
  readonly onSelectSite: (provenanceId: string) => void
  readonly onShowExcavationAreas: () => void
}

function plural(
  value: number,
  singular: string,
  pluralLabel = `${singular}s`,
): string {
  return value === 1 ? `${value} ${singular}` : `${value} ${pluralLabel}`
}

function siteHasHistoricalMap(
  siteName: string,
  historicalMapSiteNames: ReadonlySet<string>,
): boolean {
  return historicalMapSiteNames.has(siteName.toLowerCase())
}

function findProvenance(
  provenances: readonly ProvenanceRecord[],
  id: string,
): ProvenanceRecord | undefined {
  return provenances.find((provenance) => provenance.id === id)
}

function InspectorMetric({
  label,
  value,
}: {
  readonly label: string
  readonly value: string | number
}): JSX.Element {
  return (
    <div className="map-inspector__metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function FindspotRows({
  summary,
}: {
  readonly summary: PolygonFindspotSummary
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleFindspots = isExpanded
    ? summary.findspots
    : summary.findspots.slice(0, 6)

  return (
    <div className="map-inspector__findspots">
      {visibleFindspots.map((findspot) => (
        <a
          key={findspot.findspotId}
          className="map-inspector__findspot-row"
          href={buildFindspotFragmentSearchLink(findspot.findspotId)}
        >
          <span>
            <strong>Findspot {findspot.findspotId}</strong>
            <small>
              {plural(findspot.accessibleFragmentCount, 'accessible fragment')}
            </small>
          </span>
          <span>View fragments</span>
        </a>
      ))}
      {summary.findspots.length > 6 ? (
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? 'Show fewer' : `Show all ${summary.findspots.length}`}
        </Button>
      ) : null}
    </div>
  )
}

function isAssurSite(provenance?: ProvenanceRecord): boolean {
  const name = provenance?.longName.toLowerCase()
  return name === 'aššur' || name === 'assur'
}

export default function MapInspector({
  activeHistoricalMapCount,
  excavationStatusText,
  filteredProvenances,
  historicalMapSiteNames,
  linkedExcavationAreaCount,
  mappedFindspotCount,
  polygonSummaries,
  provenances,
  selection,
  showExcavationAreas,
  status,
  onBrowseHistoricalMaps,
  onClearSelection,
  onSelectSite,
  onShowExcavationAreas,
}: Props): JSX.Element {
  const topSites = useMemo(
    () => filteredProvenances.slice(0, 8),
    [filteredProvenances],
  )

  if (selection?.type === 'excavation-area') {
    const summary = polygonSummaries.get(selection.polygonId)
    const displayName = summary?.findspots[0]?.area ?? 'Excavation area'

    return (
      <aside
        className="map-inspector map-inspector--selected"
        aria-live="polite"
      >
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={onClearSelection}
        >
          Back to explore
        </Button>
        <div className="map-inspector__eyebrow">Excavation area</div>
        <h2>{displayName}</h2>
        <div className="map-inspector__metrics">
          <InspectorMetric
            label="Mapped findspots"
            value={summary?.findspotCount ?? 0}
          />
          <InspectorMetric
            label="Accessible fragments"
            value={summary?.accessibleFragmentCount ?? 0}
          />
        </div>
        {summary ? (
          <FindspotRows summary={summary} />
        ) : (
          <p>No mapped findspots are linked to this polygon.</p>
        )}
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => onBrowseHistoricalMaps('Aššur')}
        >
          Browse historical maps for Aššur
        </Button>
      </aside>
    )
  }

  if (selection?.type === 'site') {
    const provenance = findProvenance(provenances, selection.provenanceId)
    const hasHistoricalMap = provenance
      ? siteHasHistoricalMap(provenance.longName, historicalMapSiteNames)
      : false
    const isAssur = isAssurSite(provenance)

    return (
      <aside
        className="map-inspector map-inspector--selected"
        aria-live="polite"
      >
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={onClearSelection}
        >
          Back to explore
        </Button>
        <div className="map-inspector__eyebrow">Site</div>
        <h2>{provenance?.longName ?? 'Selected site'}</h2>
        {provenance?.parent ? <p>{provenance.parent}</p> : null}
        <div className="map-inspector__metrics">
          {isAssur ? (
            <InspectorMetric
              label="Mapped findspots"
              value={mappedFindspotCount}
            />
          ) : null}
          {isAssur ? (
            <InspectorMetric
              label="Linked excavation areas"
              value={linkedExcavationAreaCount}
            />
          ) : null}
          <InspectorMetric
            label="Historical maps active"
            value={activeHistoricalMapCount}
          />
        </div>
        <div className="map-inspector__actions">
          {isAssur ? (
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
          {provenance && hasHistoricalMap ? (
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
      </aside>
    )
  }

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
        <InspectorMetric
          label="Mapped Aššur findspots"
          value={mappedFindspotCount}
        />
        <InspectorMetric
          label="Linked excavation areas"
          value={linkedExcavationAreaCount}
        />
      </div>
      <div className={`map-inspector__status map-inspector__status--${status}`}>
        <strong>Aššur map data</strong>
        <span>{excavationStatusText}</span>
        <small>Enable excavation areas and click a polygon</small>
      </div>
      <div className="map-inspector__site-list" aria-label="Visible sites">
        {topSites.map((provenance) => {
          const isAssur = isAssurSite(provenance)
          return (
            <button
              key={provenance.id}
              type="button"
              className="map-inspector__site-card"
              onClick={() => onSelectSite(provenance.id)}
            >
              <span>
                <strong>{provenance.longName}</strong>
                {provenance.parent ? <small>{provenance.parent}</small> : null}
              </span>
              <span>
                {isAssur
                  ? `${linkedExcavationAreaCount} linked areas`
                  : siteHasHistoricalMap(
                        provenance.longName,
                        historicalMapSiteNames,
                      )
                    ? 'Historical maps'
                    : 'Site'}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
