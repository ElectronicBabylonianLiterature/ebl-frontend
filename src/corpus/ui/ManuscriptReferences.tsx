import React from 'react'
import Citation from 'bibliography/ui/Citation'
import Reference, { groupReferences } from 'bibliography/domain/Reference'

export default function ManuscriptReferences({
  references,
}: {
  references: readonly Reference[]
}): JSX.Element {
  return (
    <ul className="list-of-manuscripts__references">
      {groupReferences(references)
        .flatMap(([type, group]) => group)
        .map((reference, index) => (
          <li key={index}>
            <Citation reference={reference} />
          </li>
        ))}
    </ul>
  )
}
