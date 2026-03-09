import React from 'react'
import { NoteLine } from 'transliteration/domain/note-line'
import { noteNumber } from 'transliteration/domain/text'
import { LinkToLine } from './note-links'
import Markup from './markup'

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
              <Markup container="span" parts={line.parts} />
            </li>
          )
        }),
      )}
    </ol>
  )
}
