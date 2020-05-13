import React from 'react'
import classNames from 'classnames'
import { NoteLine, TextPart, NoteLinePart } from 'transliteration/domain/line'
import { noteNumber } from 'transliteration/domain/text'
import { isLanguagePart } from 'transliteration/domain/type-guards'
import LineTokens from './LineTokens'

function DispalyTextPart({
  part: { type, text },
}: {
  part: TextPart
}): JSX.Element {
  return type === 'EmphasisPart' ? <em>{text}</em> : <span>{text}</span>
}

export function DisplayNoteLine({
  line,
  container = 'div',
}: {
  line: NoteLine
  container?: string
}): JSX.Element {
  return React.createElement(
    container,
    { className: classNames([`Transliteration__${line.type}`]) },
    line.parts.map((part: NoteLinePart, index: number) =>
      isLanguagePart(part) ? (
        <LineTokens
          key={index}
          content={[
            {
              enclosureType: [],
              cleanValue: '',
              value: '',
              language: part.language,
              normalized: false,
              type: 'LanguageShift',
            },
            ...part.tokens,
          ]}
        />
      ) : (
        <DispalyTextPart key={index} part={part} />
      )
    )
  )
}

export function TransliterationNotes({
  notes,
}: {
  notes: ReadonlyMap<number, readonly NoteLine[]>
}): JSX.Element {
  return (
    <ol>
      {Array.from(notes).flatMap(([lineNumber, lines]) =>
        lines.map((line, index) => {
          const number = noteNumber(notes, lineNumber, index)
          return (
            <li key={`${lineNumber}-${index}`} id={`note-${number}`}>
              <a href={`#line-${lineNumber}`}>{number}</a>{' '}
              <DisplayNoteLine container="span" line={line} />
            </li>
          )
        })
      )}
    </ol>
  )
}
