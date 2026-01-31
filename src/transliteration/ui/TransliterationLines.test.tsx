import React from 'react'
import _ from 'lodash'
import { render, RenderResult, screen, within } from '@testing-library/react'
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

describe.each([
  [textWithNormalFirstLine, false, normaFirsLineCases],
  [textWithNoteOnFirstLine, true, noteFirstLineCases],
])('%#', (text, noteOnFirstLine, lineCases: [number, number[]][]) => {
  function setup(): { view: RenderResult; lines: HTMLElement[] } {
    const view = render(<TransliterationLines text={text} />)
    const lines = screen.getAllByRole('row')
    return { view, lines }
  }

  test('Snapshot', () => {
    const { view } = setup()
    expect(view.container).toMatchSnapshot()
  })

  test('Shows all lines', () => {
    const { lines } = setup()
    expect(lines.length).toEqual(lineCases.length)
  })

  describe.each(lineCases)(
    'Line %s with notes %p',
    (lineNumber, noteNumbers) => {
      test('ID', () => {
        const { lines } = setup()
        const index = noteOnFirstLine ? lineNumber : lineNumber - 1
        const line = lines[index]
        expect(line).toHaveAttribute('id', `line-${lineNumber}`)
      })

      test('Shows all links', () => {
        const { lines } = setup()
        const index = noteOnFirstLine ? lineNumber : lineNumber - 1
        const line = lines[index]
        const links = within(line).queryAllByRole('link')
        expect(links.length).toEqual(noteNumbers.length)
      })

      if (!_.isEmpty(noteNumbers)) {
        test.each(_.range(1, noteNumbers.length + 1))(
          '%s. link',
          (linkNumber) => {
            const { lines } = setup()
            const lineIndex = noteOnFirstLine ? lineNumber : lineNumber - 1
            const line = lines[lineIndex]
            const links = within(line).queryAllByRole('link')
            const index = linkNumber - 1
            const noteNumber = noteNumbers[index]
            const link = links[index]

            expect(link).toHaveAttribute('href', `#note-${noteNumber}`)
            expect(link).toHaveTextContent(String(noteNumber))
          },
        )
      }
    },
  )
})
