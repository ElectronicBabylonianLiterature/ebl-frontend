import React, { useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry,
  sanitizeProvenanceRecord,
} from 'fragmentarium/domain/Provenance'
import type { ExcavationPolygon } from 'map/domain/excavationPolygonIndex'
import { findMapSite } from 'map/domain/mapSites'
import { buildFragmentSearchLink } from 'map/domain/mapLinks'

interface Props {
  readonly selectionId: string
  readonly provenance?: ProvenanceRecord
  readonly polygon?: ExcavationPolygon
  readonly onClose: () => void
  readonly focusHeading?: boolean
}

function ProvenanceDetails({
  provenance,
}: {
  readonly provenance: ProvenanceRecord
}): JSX.Element {
  const uncertaintyRadiusKm =
    sanitizeProvenanceRecord(provenance).coordinates?.uncertaintyRadiusKm
  return (
    <>
      <dt>Location ID</dt>
      <dd>{provenance.id}</dd>
      {provenance.abbreviation ? (
        <>
          <dt>Abbreviation</dt>
          <dd>{provenance.abbreviation}</dd>
        </>
      ) : null}
      {provenance.parent ? (
        <>
          <dt>Parent location</dt>
          <dd>{provenance.parent}</dd>
        </>
      ) : null}
      {uncertaintyRadiusKm !== undefined && uncertaintyRadiusKm >= 0 ? (
        <>
          <dt>Location uncertainty</dt>
          <dd>
            {new Intl.NumberFormat(undefined, {
              maximumSignificantDigits: 3,
            }).format(uncertaintyRadiusKm)}{' '}
            km radius
          </dd>
        </>
      ) : null}
    </>
  )
}

function ResearchDetails({
  provenance,
  polygon,
  site,
  siteName,
}: Pick<Props, 'provenance' | 'polygon'> & {
  readonly site: ReturnType<typeof findMapSite>
  readonly siteName: string | undefined
}): JSX.Element {
  const isMappedArea =
    provenance &&
    getRenderableProvenanceGeometry(provenance)?.type === 'polygon'
  if (!provenance && !polygon) {
    return (
      <p>The selected location is not available in the current site list.</p>
    )
  }
  return (
    <>
      <p className="map-research-inspector__type">
        {polygon
          ? 'Excavation area'
          : isMappedArea
            ? 'Mapped area'
            : 'Site location'}
      </p>
      <dl className="map-research-inspector__details">
        {site ? (
          <>
            <dt>Archaeological site</dt>
            <dd>{site.siteName}</dd>
          </>
        ) : null}
        {provenance ? <ProvenanceDetails provenance={provenance} /> : null}
        {polygon ? (
          <>
            <dt>Site identifier</dt>
            <dd>{polygon.siteId}</dd>
          </>
        ) : null}
      </dl>
      {provenance?.coordinates?.notes ? (
        <p className="map-research-inspector__source">
          {provenance.coordinates.notes}
        </p>
      ) : null}
      {siteName ? (
        <Link to={buildFragmentSearchLink(siteName)}>
          Search {siteName} in the Library
        </Link>
      ) : null}
    </>
  )
}

export default function MapResearchInspector({
  selectionId,
  provenance,
  polygon,
  onClose,
  focusHeading = true,
}: Props): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const site = polygon ? findMapSite(polygon.siteId) : undefined
  const siteName = provenance?.longName ?? site?.siteName

  useEffect(() => {
    if (focusHeading) headingRef.current?.focus()
  }, [focusHeading, selectionId])

  return (
    <section
      className="map-research-inspector"
      aria-label="Location details"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <div className="map-research-inspector__header">
        <h4 ref={headingRef} tabIndex={-1}>
          {polygon?.name ?? siteName ?? 'Location details'}
        </h4>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={onClose}
          aria-label="Close location details"
        >
          Close
        </Button>
      </div>
      <ResearchDetails
        provenance={provenance}
        polygon={polygon}
        site={site}
        siteName={siteName}
      />
    </section>
  )
}
