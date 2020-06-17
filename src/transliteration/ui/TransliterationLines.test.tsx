import React from 'react'
import _ from 'lodash'
import { render, within, RenderResult } from '@testing-library/react'
import noteLine from 'test-support/lines/note'
import { singleRuling } from 'test-support/lines/dollar'
import TransliterationLines from './TransliterationLines'
import { Text } from 'transliteration/domain/text'

const textWithNormalFirstLine = new Text({
  lines: [
    singleRuling,
    noteLine,
    noteLine,
    singleRuling,
    singleRuling,
    noteLine,
  ],
})
const normaFirsLineCases: [number, number[]][] = [
  [1, [1, 2]],
  [2, []],
  [3, [3]],
]

const textWithNoteOnFirstLine = new Text({
  lines: [noteLine, noteLine, singleRuling],
})
const noteFirstLineCases: [number, number[]][] = [
  [0, [1, 2]],
  [1, []],
]

let element: RenderResult
let lines: HTMLElement[]

describe.each([
  [textWithNormalFirstLine, false, normaFirsLineCases],
  [textWithNoteOnFirstLine, true, noteFirstLineCases],
])('%#', (text, noteOnFirstLine, lineCases: [number, number[]][]) => {
  beforeEach(() => {
    element = render(<TransliterationLines text={text} />)
    lines = element.getAllByRole('row')
  })

  test('Snapshot', () => {
    expect(element.container).toMatchSnapshot()
  })

  test('Shows all lines', () => {
    expect(lines.length).toEqual(lineCases.length)
  })

  describe.each(lineCases)(
    'Line %s with notes %p',
    (lineNumber, noteNumbers) => {
      let line: HTMLElement
      let links: HTMLElement[]

      beforeEach(() => {
        const index = noteOnFirstLine ? lineNumber : lineNumber - 1
        line = lines[index]
        links = within(line).queryAllByRole('link')
      })

      test('ID', () => {
        expect(line).toHaveAttribute('id', `line-${lineNumber}`)
      })

      test('Shows all links', () => {
        expect(links.length).toEqual(noteNumbers.length)
      })

      if (!_.isEmpty(noteNumbers)) {
        test.each(_.range(1, noteNumbers.length + 1))(
          '%s. link',
          (linkNumber) => {
            const index = linkNumber - 1
            const noteNumber = noteNumbers[index]
            const link = links[index]

            expect(link).toHaveAttribute('href', `#note-${noteNumber}`)
            expect(link).toHaveTextContent(String(noteNumber))
          }
        )
      }
    }
  )
})
