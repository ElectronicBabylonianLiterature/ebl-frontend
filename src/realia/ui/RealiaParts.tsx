import React from 'react'
import { RealiaCrossReference, RealiaEntry } from 'realia/domain/RealiaEntry'
import { RealiaCrossReferenceLink } from 'realia/ui/RealiaCrossReferenceLink'
import ExternalLink from 'common/ui/ExternalLink'
import {
  EntryMetadata,
  EntryMetadataItem,
} from 'common/ui/entry-page/EntrySection'

export function RealiaMetadata({ entry }: { entry: RealiaEntry }): JSX.Element {
  const typeLabels = entry.type.join(', ') || '—'
  return (
    <EntryMetadata>
      {entry.wikidataId.map((wikidataId) => (
        <span key={wikidataId}>
          <ExternalLink href={`https://www.wikidata.org/wiki/${wikidataId}`}>
            Wikidata: {wikidataId}
          </ExternalLink>
        </span>
      ))}
      {entry.relatedTerms.length > 0 && (
        <EntryMetadataItem label="Related terms">
          {entry.relatedTerms.join(', ')}
        </EntryMetadataItem>
      )}
      <EntryMetadataItem label="Type">{typeLabels}</EntryMetadataItem>
    </EntryMetadata>
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
