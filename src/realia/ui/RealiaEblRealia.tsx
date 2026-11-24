import React from 'react'
import { EblRealiaEntry } from 'realia/domain/RealiaEntry'
import { eblRealiaEntryId } from 'realia/ui/realiaSections'
import { WikidataLinks } from 'realia/ui/RealiaParts'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { eblRealiaEntryLabel } from 'realia/domain/eblRealiaEntryLabel'
import { partOfSpeechLabel } from 'dictionary/domain/positionsOfSpeech'

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

interface EblRealiaField {
  readonly label: string
  readonly value: React.ReactNode
}

function formatPartOfSpeech(pos: string): string {
  const label = partOfSpeechLabel(pos)
  return label ? `${label} (${pos})` : pos
}

function getEblRealiaFields(entry: EblRealiaEntry): readonly EblRealiaField[] {
  const fields: readonly EblRealiaField[] = [
    {
      label: 'Normalisation',
      value: entry.normalisation && <em>{entry.normalisation}</em>,
    },
    { label: 'Translation', value: entry.translation },
    { label: 'Identification', value: entry.identification },
    {
      label: 'Part of speech',
      value: entry.pos && formatPartOfSpeech(entry.pos),
    },
    {
      label: 'Links',
      value: entry.wikidataId.length > 0 && (
        <WikidataLinks wikidataIds={entry.wikidataId} />
      ),
    },
    { label: 'Remarks', value: entry.remarks },
  ]
  return fields.filter((field) => Boolean(field.value))
}

function EblRealiaHeading({
  entry,
  label,
}: {
  entry: EblRealiaEntry
  label: string
}): JSX.Element {
  return (
    <h3 className="Realia__ebl-heading">
      {entry.transliteration ? (
        <EblTransliteration transliteration={entry.transliteration} />
      ) : (
        label
      )}
    </h3>
  )
}

function EblRealiaArticle({
  entry,
  index,
}: {
  entry: EblRealiaEntry
  index: number
}): JSX.Element {
  const label = eblRealiaEntryLabel(entry, index)
  const fields = getEblRealiaFields(entry)
  return (
    <article
      id={eblRealiaEntryId(index)}
      className="Realia__ebl-article"
      aria-label={label}
    >
      <EblRealiaHeading entry={entry} label={label} />
      {fields.length > 0 && (
        <dl className="Realia__ebl-fields">
          {fields.map((field) => (
            <div key={field.label} className="Realia__ebl-field">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      )}
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
