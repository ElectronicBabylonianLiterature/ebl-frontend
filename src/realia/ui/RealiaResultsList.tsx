import React from 'react'
import { Link } from 'react-router-dom'
import { RealiaEntry, REALIA_TYPE_LABELS } from 'realia/domain/RealiaEntry'

function entrySubtitle(entry: RealiaEntry): string {
  const typeLabels = entry.type.map((t) => REALIA_TYPE_LABELS[t]).join(', ')
  const terms = entry.relatedTerms.join(', ')
  if (typeLabels && terms) {
    return `${typeLabels} — ${terms}`
  }
  return typeLabels || terms
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
      {entries.map((entry) => {
        const subtitle = entrySubtitle(entry)
        return (
          <li key={entry.id} className="realia-results-list__item">
            <Link to={'/tools/realia/' + encodeURIComponent(entry.id)}>
              {entry.id}
            </Link>
            {subtitle && (
              <span className="realia-results-list__subtitle">
                {' '}
                — {subtitle}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
