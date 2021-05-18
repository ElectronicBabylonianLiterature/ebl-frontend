import React from 'react'
import classNames from 'classnames'
import { NoteLine } from 'transliteration/domain/note-line'
import { MarkupPart } from 'transliteration/domain/markup'
import { noteNumber } from 'transliteration/domain/text'
import {
  isLanguagePart,
  isBibliographyPart,
} from 'transliteration/domain/type-guards'
import { LinkToLine } from './note-links'
import {
  DisplayBibliographyPart,
  DisplayLaguagePart,
  DisplayTextPart,
} from './markup'

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
    line.parts.map((part: MarkupPart, index: number) => {
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
