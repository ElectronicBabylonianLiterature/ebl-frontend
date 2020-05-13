import React from 'react'
import _ from 'lodash'
import { render, within, RenderResult } from '@testing-library/react'
import noteLine from 'test-helpers/lines/note'
import { singleRuling } from 'test-helpers/lines/dollar'
import TransliterationLines from './TransliterationLines'
import { Text } from 'transliteration/domain/text'

let element: RenderResult
let lines: HTMLElement[]

beforeEach(() => {
  const text = new Text({
    lines: [
      singleRuling,
      noteLine,
      noteLine,
      singleRuling,
      singleRuling,
      noteLine,
    ],
  })
  element = render(<TransliterationLines text={text} />)
  lines = element.getAllByRole('listitem')
})

test('Snapshot', () => {
  expect(element.container).toMatchSnapshot()
})

test('Shows all lines', () => {
  expect(lines.length).toEqual(3)
})

describe.each([
  [1, [1, 2]],
  [2, []],
  [3, [3]],
])('Line %s with notes %p', (lineNumber, noteNumbers) => {
  let line: HTMLElement
  let links: HTMLElement[]

  beforeEach(() => {
    line = lines[lineNumber - 1]
    links = within(line).queryAllByRole('link')
  })

  test('ID', () => {
    expect(line).toHaveAttribute('id', `line-${lineNumber}`)
  })

  test('Shows all links', () => {
    expect(links.length).toEqual(noteNumbers.length)
  })

  if (!_.isEmpty(noteNumbers)) {
    test.each(_.range(1, noteNumbers.length + 1))('%s. link', (linkNumber) => {
      const index = linkNumber - 1
      const noteNumber = noteNumbers[index]
      const link = links[index]

      expect(link).toHaveAttribute('href', `#note-${noteNumber}`)
      expect(link).toHaveTextContent(String(noteNumber))
    })
  }
})
