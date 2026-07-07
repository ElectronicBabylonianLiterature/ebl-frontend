import React from 'react'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  RealiaCrossReference,
  RealiaEntry,
  realiaCrossReferenceTarget,
} from 'realia/domain/RealiaEntry'
import ExternalLink from 'common/ui/ExternalLink'

export function RealiaMetadata({ entry }: { entry: RealiaEntry }): JSX.Element {
  const typeLabels = entry.type.join(', ') || '—'
  return (
    <div className="Realia__metadata">
      {entry.wikidataId.map((wikidataId) => (
        <span key={wikidataId}>
          <ExternalLink href={`https://www.wikidata.org/wiki/${wikidataId}`}>
            Wikidata: {wikidataId}
          </ExternalLink>{' '}
        </span>
      ))}
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
          <Link
            to={`/tools/realia/${encodeURIComponent(
              realiaCrossReferenceTarget(crossReference),
            )}`}
          >
            {crossReference.lemma}
          </Link>
        </li>
      ))}
    </ul>
  )
}
