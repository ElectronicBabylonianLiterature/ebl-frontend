import React from 'react'
import { ReallexikonEntry, rlaArticleUrl } from 'realia/domain/RealiaEntry'
import ExternalLink from 'common/ui/ExternalLink'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { rlaArticleId } from 'realia/ui/realiaSections'

export function ReallexikonEntries({
  entries,
}: {
  entries: readonly ReallexikonEntry[]
}): JSX.Element {
  return (
    <>
      {entries.map((entry, index) => (
        <div
          key={`${entry.id}-${index}`}
          id={rlaArticleId(entry.title)}
          className="Realia__rla-article"
        >
          <h3 className="Realia__rla-title">
            {entry.title}
            <ExternalLink
              href={rlaArticleUrl(entry.id)}
              className="Realia__rla-title-link"
              aria-label={`Open ${entry.title} on the online RlA`}
            >
              <i className="fas fa-external-link-alt" aria-hidden="true" />
            </ExternalLink>
          </h3>
          {entry.reference && (
            <div className="Realia__rla-references">
              <ReferenceList references={[entry.reference]} />
            </div>
          )}
        </div>
      ))}
    </>
  )
}
