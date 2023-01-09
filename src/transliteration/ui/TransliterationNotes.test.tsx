import { render, RenderResult, screen, within } from '@testing-library/react'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import React from 'react'
import { hydratedNote, note } from 'test-support/lines/note'
import TransliterationNotes from './TransliterationNotes'

jest.mock('dictionary/application/WordService')

let element: RenderResult
let lines: HTMLElement[]

beforeEach(() => {
  const notes = new Map([
    [0, [note]],
    [1, []],
    [2, [note, hydratedNote]],
  ])
  element = render(
    <DictionaryContext.Provider
      value={new (WordService as jest.Mock<WordService>)()}
    >
      <TransliterationNotes notes={notes} />
    </DictionaryContext.Provider>
  )
  lines = screen.getAllByRole('listitem')
})

test('Snapshot', () => {
  expect(element.container).toMatchSnapshot()
})

test('Shows all notes', () => {
  expect(lines.length).toEqual(3)
})

describe.each([
  [1, 0],
  [2, 2],
  [3, 2],
])('Note %s from line %s', (noteNumber, lineNumber) => {
  let line: HTMLElement

  beforeEach(() => {
    line = lines[noteNumber - 1]
  })

  test('ID', () => {
    expect(line).toHaveAttribute('id', `note-${noteNumber}`)
  })

  test('link', () => {
    const link = within(line).getByRole('link')

    expect(link).toHaveAttribute('href', `#line-${lineNumber}`)
    expect(link).toHaveTextContent(String(noteNumber))
  })
})
