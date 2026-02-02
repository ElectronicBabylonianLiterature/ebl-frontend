import { render, RenderResult, screen, within } from '@testing-library/react'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import React from 'react'
import { hydratedNote, note } from 'test-support/lines/note'
import TransliterationNotes from './TransliterationNotes'

jest.mock('dictionary/application/WordService')

function setup(): { view: RenderResult; lines: HTMLElement[] } {
  const notes = new Map([
    [0, [note]],
    [1, []],
    [2, [note, hydratedNote]],
  ])
  const view = render(
    <DictionaryContext.Provider
      value={new (WordService as jest.Mock<WordService>)()}
    >
      <TransliterationNotes notes={notes} />
    </DictionaryContext.Provider>,
  )
  const lines = screen.getAllByRole('listitem')
  return { view, lines }
}

test('Shows all notes', () => {
  const { lines } = setup()
  expect(lines.length).toEqual(3)
})

describe.each([
  [1, 0],
  [2, 2],
  [3, 2],
])('Note %s from line %s', (noteNumber, lineNumber) => {
  test('ID', () => {
    const { lines } = setup()
    const line = lines[noteNumber - 1]
    expect(line).toHaveAttribute('id', `note-${noteNumber}`)
  })

  test('link', () => {
    const { lines } = setup()
    const line = lines[noteNumber - 1]
    const link = within(line).getByRole('link')

    expect(link).toHaveAttribute('href', `#line-${lineNumber}`)
    expect(link).toHaveTextContent(String(noteNumber))
  })
})
