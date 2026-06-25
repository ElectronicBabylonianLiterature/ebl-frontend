import React from 'react'
import { Link } from 'react-router-dom'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import 'realia/ui/Realia.sass'

interface SourceBadge {
  readonly label: string
  readonly count?: number
}

function getSourceBadges(entry: RealiaEntry): readonly SourceBadge[] {
  const badges: SourceBadge[] = []
  if (entry.reallexikon.length > 0) {
    badges.push({ label: 'RlA' })
  }
  if (entry.afoRegister.length > 0) {
    badges.push({ label: 'AfO', count: entry.afoRegister.length })
  }
  if (entry.references.length > 0) {
    badges.push({ label: 'References', count: entry.references.length })
  }
  if (entry.wikidataId.length > 0) {
    badges.push({ label: 'Wikidata' })
  }
  return badges
}

function RealiaResultItem({ entry }: { entry: RealiaEntry }): JSX.Element {
  const sourceBadges = getSourceBadges(entry)
  return (
    <li className="realia-results-list__item">
      <div className="realia-results-list__header">
        <Link
          className="realia-results-list__title"
          to={'/tools/realia/' + encodeURIComponent(entry.realiaId)}
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
      {sourceBadges.length > 0 && (
        <div className="realia-results-list__sources">
          {sourceBadges.map((badge) => (
            <span key={badge.label} className="realia-results-list__source">
              {badge.label}
              {badge.count !== undefined && (
                <span className="realia-results-list__source-count">
                  ({badge.count})
                </span>
              )}
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
    <ul className="realia-results-list">
      {entries.map((entry) => (
        <RealiaResultItem key={entry.realiaId} entry={entry} />
      ))}
    </ul>
  )
}
