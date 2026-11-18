import React from 'react'
import { EblRealiaEntry } from 'realia/domain/RealiaEntry'
import { eblRealiaEntryId } from 'realia/ui/realiaSections'
import { WikidataLinks } from 'realia/ui/RealiaParts'
import ReferenceList from 'bibliography/ui/ReferenceList'

const transliterationSegmentPattern = /([-.\s]+)/

function isAkkadianSegment(segment: string): boolean {
  return segment !== segment.toUpperCase()
}

export function EblTransliteration({
  transliteration,
}: {
  transliteration: string
}): JSX.Element {
  return (
    <span className="Realia__ebl-transliteration">
      {transliteration
        .split(transliterationSegmentPattern)
        .map((segment, index) =>
          isAkkadianSegment(segment) ? (
            <em key={index}>{segment}</em>
          ) : (
            <React.Fragment key={index}>{segment}</React.Fragment>
          ),
        )}
    </span>
  )
}

function EblRealiaField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </>
  )
}

function EblRealiaArticle({
  entry,
  index,
}: {
  entry: EblRealiaEntry
  index: number
}): JSX.Element {
  return (
    <article
      id={eblRealiaEntryId(index)}
      className="Realia__ebl-article"
      aria-label={entry.transliteration}
    >
      <h3 className="Realia__ebl-heading">
        <EblTransliteration transliteration={entry.transliteration} />
      </h3>
      <dl className="Realia__ebl-fields">
        {entry.normalisation && (
          <EblRealiaField label="Normalisation">
            <em>{entry.normalisation}</em>
          </EblRealiaField>
        )}
        <EblRealiaField label="Translation">{entry.translation}</EblRealiaField>
        <EblRealiaField label="Identification">
          {entry.identification}
        </EblRealiaField>
        <EblRealiaField label="Part of speech">{entry.pos}</EblRealiaField>
        {entry.wikidataId.length > 0 && (
          <EblRealiaField label="Wikidata">
            <WikidataLinks wikidataIds={entry.wikidataId} />
          </EblRealiaField>
        )}
        {entry.remarks && (
          <EblRealiaField label="Remarks">{entry.remarks}</EblRealiaField>
        )}
      </dl>
      {entry.reference && (
        <div className="Realia__ebl-references">
          <ReferenceList references={[entry.reference]} />
        </div>
      )}
    </article>
  )
}

export function EblRealiaEntries({
  entries,
}: {
  entries: readonly EblRealiaEntry[]
}): JSX.Element {
  return (
    <>
      {entries.map((entry, index) => (
        <EblRealiaArticle key={entry.id} entry={entry} index={index} />
      ))}
    </>
  )
}
