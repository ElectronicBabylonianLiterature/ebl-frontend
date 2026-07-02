import React from 'react'
import { ReallexikonEntry } from 'realia/domain/RealiaEntry'
import { ReallexikonArticle } from 'realia/ui/ReallexikonArticle'

export function ReallexikonEntries({
  entries,
}: {
  entries: readonly ReallexikonEntry[]
}): JSX.Element {
  return (
    <>
      <p className="Realia__rla-permission">
        The RlA page display is shown with the kind permission of the
        Reallexikon der Assyriologie und Vorderasiatischen Archäologie project
        (Bayerische Akademie der Wissenschaften) and the publisher Walter de
        Gruyter.
      </p>
      {entries.map((entry, index) => (
        <ReallexikonArticle key={`${entry.id}-${index}`} entry={entry} />
      ))}
    </>
  )
}
