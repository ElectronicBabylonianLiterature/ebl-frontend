import React from 'react'
import { noteNumber, Notes } from 'transliteration/domain/text'

export function createNoteId(number: number): string {
  return `note-${number}`
}

export function createLineId(number: number): string {
  return `line-${number}`
}

function NoteLink({
  href,
  number,
}: {
  href: string
  number: number
}): JSX.Element {
  return (
    <>
      <a className="Transliteration__NoteLink" href={href}>
        {number}
      </a>{' '}
    </>
  )
}

export function LinkToLine({
  number,
  lineNumber,
}: {
  number: number
  lineNumber: number
}): JSX.Element {
  const lineHref = `#${createLineId(lineNumber)}`
  return <NoteLink href={lineHref} number={number} />
}

function LinkToNote({ number }: { number: number }): JSX.Element {
  const noteHref = `#${createNoteId(number)}`
  return <NoteLink href={noteHref} number={number} />
}

export function NoteLinks({
  notes,
  lineNumber,
}: {
  notes: Notes
  lineNumber: number
}): JSX.Element {
  return (
    <>
      {' '}
      {notes.get(lineNumber)?.map((note, noteIndex) => {
        const number = noteNumber(notes, lineNumber, noteIndex)
        return <LinkToNote key={noteIndex} number={number} />
      })}
    </>
  )
}
