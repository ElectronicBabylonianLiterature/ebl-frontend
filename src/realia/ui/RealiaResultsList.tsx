import React from 'react'
import { Link } from 'react-router-dom'
import {
  getReferenceTypes,
  getReferenceTypeSectionSizes,
  RealiaEntry,
} from 'realia/domain/RealiaEntry'
import { getRealiaPageUrl } from 'realia/ui/realiaPage'
import { ReferenceTypeBadge, ReferenceTypeLegend } from 'realia/ui/RealiaParts'
import 'realia/ui/Realia.sass'

interface SourceBadge {
  readonly label: string
  readonly count?: number
}

function SourceCount({ count }: { count?: number }): JSX.Element | null {
  return count === undefined ? null : (
    <span className="realia-results-list__source-count">({count})</span>
  )
}

function getSourceBadges(entry: RealiaEntry): readonly SourceBadge[] {
  const badges: SourceBadge[] = []
  if (entry.references.length > 0) {
    badges.push({ label: 'References', count: entry.references.length })
  }
  if (entry.wikidataId.length > 0) {
    badges.push({ label: 'Wikidata' })
  }
  return badges
}

function RealiaResultItem({ entry }: { entry: RealiaEntry }): JSX.Element {
  const referenceTypes = getReferenceTypes(entry)
  const sectionSizes = getReferenceTypeSectionSizes(entry)
  const sourceBadges = getSourceBadges(entry)
  return (
    <li className="realia-results-list__item">
      <div className="realia-results-list__header">
        <Link
          className="realia-results-list__title"
          to={getRealiaPageUrl(entry.id)}
        >
          {entry.id}
        </Link>
        {entry.type.map((label) => (
          <span key={label} className="realia-results-list__type">
            {label}
          </span>
        ))}
      </div>
      {entry.relatedTerms.length > 0 && (
        <div className="realia-results-list__terms">
          {entry.relatedTerms.join(', ')}
        </div>
      )}
      {(referenceTypes.length > 0 || sourceBadges.length > 0) && (
        <div className="realia-results-list__sources">
          {referenceTypes.map((referenceType) => (
            <ReferenceTypeBadge
              key={referenceType}
              referenceType={referenceType}
              className="realia-results-list__source"
            >
              <SourceCount count={sectionSizes[referenceType]} />
            </ReferenceTypeBadge>
          ))}
          {sourceBadges.map((badge) => (
            <span key={badge.label} className="realia-results-list__source">
              {badge.label}
              <SourceCount count={badge.count} />
            </span>
          ))}
        </div>
      )}
    </li>
  )
}

export default function RealiaResultsList({
  entries,
}: {
  entries: readonly RealiaEntry[]
}): JSX.Element {
  if (entries.length === 0) {
    return <p>No results found.</p>
  }
  return (
    <>
      {entries.some((entry) => getReferenceTypes(entry).length > 0) && (
        <ReferenceTypeLegend />
      )}
      <ul className="realia-results-list">
        {entries.map((entry) => (
          <RealiaResultItem key={entry.realiaId} entry={entry} />
        ))}
      </ul>
    </>
  )
}
