import React from 'react'
import { Notes } from 'transliteration/domain/text'
import { createLineId, NoteLinks } from 'transliteration/ui/note-links'

export default function LineNotes({
  notes,
  lineNumber,
  hiddenLineNumbers,
}: {
  notes: Notes
  lineNumber: number
  hiddenLineNumbers: readonly number[]
}): JSX.Element {
  return (
    <>
      <NoteLinks notes={notes} lineNumber={lineNumber} />
      {hiddenLineNumbers.map((hiddenLineNumber) => (
        <span key={hiddenLineNumber} id={createLineId(hiddenLineNumber)}>
          <NoteLinks notes={notes} lineNumber={hiddenLineNumber} />
        </span>
      ))}
    </>
  )
}
