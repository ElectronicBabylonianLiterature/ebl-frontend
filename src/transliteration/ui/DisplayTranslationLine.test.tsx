import React from 'react'
import { render, screen } from '@testing-library/react'
import DisplayTranslationLine from 'transliteration/ui/DisplayTranslationLine'
import { lineNumberFactory } from 'test-support/linenumber-factory'
import TranslationLine from 'transliteration/domain/translation-line'
import {
  englishTranslationLine,
  englishTranslationLineWithExtent,
} from 'test-support/lines/translation-lines'

const labelledTranslationLine = new TranslationLine({
  language: 'en',
  extent: {
    number: lineNumberFactory.build({ number: 3 }),
    labels: ['o', 'i'],
  },
  parts: [{ text: 'labelled', type: 'StringPart' }],
  content: [],
})

test.each([
  [englishTranslationLine, 'en:'],
  [englishTranslationLineWithExtent, 'en (3):'],
  [labelledTranslationLine, 'en (o i 3):'],
])('shows the language and extent of translation line %#', (line, text) => {
  render(
    <table>
      <tbody>
        <tr>
          <DisplayTranslationLine line={line} columns={2} />
        </tr>
      </tbody>
    </table>,
  )

  expect(screen.getAllByRole('cell')[0]).toHaveTextContent(text)
})

test('labelled extents are part of the translation line prefix', () => {
  expect(labelledTranslationLine.prefix).toEqual('#tr.en.(o i 3): ')
})
