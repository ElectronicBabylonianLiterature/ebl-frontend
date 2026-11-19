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
}

export default function MapResearchInspector({
  selectionId,
  provenance,
  polygon,
  onClose,
}: Props): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const site = polygon ? findMapSite(polygon.siteId) : undefined
  const siteName = provenance?.longName ?? site?.siteName
  const isMappedArea =
    provenance &&
    getRenderableProvenanceGeometry(provenance)?.type === 'polygon'
  const uncertaintyRadiusKm =
    provenance &&
    sanitizeProvenanceRecord(provenance).coordinates?.uncertaintyRadiusKm

  useEffect(() => {
    headingRef.current?.focus()
  }, [selectionId])

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
      {provenance || polygon ? (
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
            {provenance ? (
              <>
                <dt>Location ID</dt>
                <dd>{provenance.id}</dd>
              </>
            ) : null}
            {provenance?.abbreviation ? (
              <>
                <dt>Abbreviation</dt>
                <dd>{provenance.abbreviation}</dd>
              </>
            ) : null}
            {provenance?.parent ? (
              <>
                <dt>Parent location</dt>
                <dd>{provenance.parent}</dd>
              </>
            ) : null}
            {polygon ? (
              <>
                <dt>Site identifier</dt>
                <dd>{polygon.siteId}</dd>
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
      ) : (
        <p>The selected location is not available in the current site list.</p>
      )}
    </section>
  )
}
