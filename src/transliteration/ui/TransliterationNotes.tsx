import React from 'react'
import classNames from 'classnames'
import {
  NoteLine,
  TextPart,
  NoteLinePart,
  LanguagePart,
  BibliographyPart,
} from 'transliteration/domain/line'
import { noteNumber } from 'transliteration/domain/text'
import {
  isLanguagePart,
  isBibliographyPart,
} from 'transliteration/domain/type-guards'
import LineTokens from './LineTokens'
import { LinkToLine } from './note-links'
import { Shift } from 'transliteration/domain/token'

function DisplayTextPart({
  part: { type, text },
}: {
  part: TextPart
}): JSX.Element {
  return type === 'EmphasisPart' ? <em>{text}</em> : <span>{text}</span>
}

function DisplayLaguagePart({ part }: { part: LanguagePart }): JSX.Element {
  const initialShift: Shift = {
    enclosureType: [],
    cleanValue: '',
    value: '',
    language: part.language,
    normalized: false,
    type: 'LanguageShift',
  }
  return <LineTokens content={[initialShift, ...part.tokens]} />
}

function DisplayBibliographyPart({
  part,
}: {
  part: BibliographyPart
}): JSX.Element {
  return (
    <span>
      @bib&#123;{part.reference.id}@{part.reference.pages}&#125;
    </span>
  )
}

function DisplayNoteLine({
  line,
  container = 'div',
}: {
  line: NoteLine
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${line.type}`]) },
    line.parts.map((part: NoteLinePart, index: number) => {
      if (isLanguagePart(part)) {
        return <DisplayLaguagePart key={index} part={part} />
      } else if (isBibliographyPart(part)) {
        return <DisplayBibliographyPart key={index} part={part} />
      } else {
        return <DisplayTextPart key={index} part={part} />
      }
    })
  )
}

export default function TransliterationNotes({
  notes,
}: {
  notes: ReadonlyMap<number, readonly NoteLine[]>
}): JSX.Element {
  return (
    <ol className="Transliteration__notes">
      {Array.from(notes).flatMap(([lineNumber, lines]) =>
        lines.map((line, index) => {
          const number = noteNumber(notes, lineNumber, index)
          return (
            <li key={`${lineNumber}-${index}`} id={`note-${number}`}>
              <LinkToLine lineNumber={lineNumber} number={number} />
              <DisplayNoteLine container="span" line={line} />
            </li>
          )
        })
      )}
    </ol>
  )
}
