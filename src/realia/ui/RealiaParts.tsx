import React from 'react'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'
import {
  getReferenceTypes,
  RealiaCrossReference,
  RealiaEntry,
  RealiaReferenceType,
  realiaReferenceTypeNames,
  realiaReferenceTypes,
} from 'realia/domain/RealiaEntry'
import { RealiaCrossReferenceLink } from 'realia/ui/RealiaCrossReferenceLink'
import ExternalLink from 'common/ui/ExternalLink'

export function WikidataLinks({
  wikidataIds,
}: {
  wikidataIds: readonly string[]
}): JSX.Element {
  return (
    <>
      {wikidataIds.map((wikidataId, index) => (
        <span key={wikidataId}>
          <ExternalLink href={`https://www.wikidata.org/wiki/${wikidataId}`}>
            {wikidataIds.length > 1 ? `Wikidata ${index + 1}` : 'Wikidata'}
          </ExternalLink>{' '}
        </span>
      ))}
    </>
  )
}

export function ReferenceTypeBadge({
  referenceType,
  className = 'Realia__reference-type',
  children,
}: {
  referenceType: RealiaReferenceType
  className?: string
  children?: React.ReactNode
}): JSX.Element {
  const name = realiaReferenceTypeNames[referenceType]
  return (
    <span className={className}>
      <abbr title={name} aria-hidden="true">
        {referenceType}
      </abbr>
      <span className="visually-hidden">{name}</span>
      {children}
    </span>
  )
}

export function ReferenceTypeLegend(): JSX.Element {
  return (
    <dl className="Realia__reference-type-legend">
      {realiaReferenceTypes.map((referenceType) => (
        <div key={referenceType}>
          <dt>{referenceType}</dt>
          <dd>{realiaReferenceTypeNames[referenceType]}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ReferenceTypeBadges({
  entry,
}: {
  entry: RealiaEntry
}): JSX.Element | null {
  const referenceTypes = getReferenceTypes(entry)
  if (referenceTypes.length === 0) {
    return null
  }
  return (
    <div
      className="Realia__reference-types"
      role="group"
      aria-label="Reference types"
    >
      {referenceTypes.map((referenceType) => (
        <ReferenceTypeBadge key={referenceType} referenceType={referenceType} />
      ))}
    </div>
  )
}

export function RealiaMetadata({ entry }: { entry: RealiaEntry }): JSX.Element {
  const typeLabels = entry.type.join(', ') || '—'
  return (
    <div className="Realia__metadata">
      <WikidataLinks wikidataIds={entry.wikidataId} />
      {entry.relatedTerms.length > 0 && (
        <span>
          <span className="Realia__metadata-label">Related terms: </span>
          {entry.relatedTerms.join(', ')}{' '}
        </span>
      )}
      <span>
        <span className="Realia__metadata-label">Type: </span>
        {typeLabels}
      </span>
    </div>
  )
}

export function RealiaSection({
  id,
  heading,
  open,
  onToggle,
  children,
}: {
  id: string
  heading: string
  open: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <section id={id} className="Realia__section">
      <h2 className="Realia__section-heading">
        <button
          type="button"
          className="Realia__section-toggle"
          aria-expanded={open}
          onClick={(): void => onToggle(id)}
        >
          <i
            className={classNames('fas', 'Realia__section-caret', {
              'fa-caret-down': open,
              'fa-caret-right': !open,
            })}
            aria-hidden="true"
          />
          {heading}
        </button>
      </h2>
      <Collapse in={open}>
        <div>{children}</div>
      </Collapse>
    </section>
  )
}

export function SeeAlsoList({
  crossReferences,
}: {
  crossReferences: readonly RealiaCrossReference[]
}): JSX.Element {
  return (
    <ul className="Realia__see-also">
      {crossReferences.map((crossReference) => (
        <li key={crossReference.id}>
          <RealiaCrossReferenceLink crossReference={crossReference} />
        </li>
      ))}
    </ul>
  )
}
