import React from 'react'
import TransliterationNotes from './TransliterationNotes'
import { render, screen, within, RenderResult } from '@testing-library/react'
import noteLine from 'test-helpers/lines/note'

let element: RenderResult
let lines: HTMLElement[]

beforeEach(() => {
  const notes = new Map([
    [0, [noteLine]],
    [1, []],
    [2, [noteLine, noteLine]],
  ])
  element = render(<TransliterationNotes notes={notes} />)
  lines = element.getAllByRole('listitem')
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
