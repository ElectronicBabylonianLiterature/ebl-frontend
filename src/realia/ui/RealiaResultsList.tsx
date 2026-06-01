import React from 'react'
import { Link } from 'react-router-dom'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

export default function RealiaResultsList({
  entries,
}: {
  entries: readonly RealiaEntry[]
}): JSX.Element {
  if (entries.length === 0) {
    return <p>No results found.</p>
  }
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.id}>
          <Link to={'/tools/realia/' + encodeURIComponent(entry.id)}>
            {entry.id}
          </Link>
        </li>
      ))}
    </ul>
  )
}
