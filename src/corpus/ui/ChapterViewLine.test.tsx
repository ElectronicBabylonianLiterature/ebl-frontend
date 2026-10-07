import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChapterViewLine } from 'corpus/ui/ChapterViewLine'
import RowsContext, { useRowsContext } from 'corpus/ui/RowsContext'
import TranslationContext, {
  useTranslationContext,
} from 'corpus/ui/TranslationContext'
import { LineDisplay } from 'corpus/domain/chapter'
import {
  chapterDisplayFactory,
  lineDisplayFactory,
} from 'test-support/chapter-fixtures'
import { textServiceMock } from 'test-support/line-group-fixtures'
import { tokenWithClass } from 'test-support/fragment-query-preview'
import { Token } from 'transliteration/domain/token'
import TranslationLine from 'transliteration/domain/translation-line'

const chapter = chapterDisplayFactory.build()
const caesura: Token = {
  value: '||',
  cleanValue: '||',
  enclosureType: [],
  erasure: 'NONE',
  isUncertain: false,
  type: 'Caesura',
}
const baseLine = lineDisplayFactory.build()
const [primary] = baseLine.variants
const line: LineDisplay = {
  ...baseLine,
  translation: [
    new TranslationLine({
      language: 'en',
      extent: null,
      parts: [{ text: 'Line translation', type: 'StringPart' }],
      content: [],
    }),
  ],
  variants: [
    {
      ...primary,
      originalIndex: 1,
      reconstruction: [...primary.reconstruction, caesura],
    },
    { ...primary, originalIndex: 2, isPrimaryVariant: false },
  ],
}

function LineWithContexts({ language }: { language: string }): JSX.Element {
  return (
    <RowsContext.Provider value={useRowsContext(1)}>
      <TranslationContext.Provider value={useTranslationContext(language)}>
        <table>
          <tbody>
            <ChapterViewLine
              chapter={chapter}
              lineIndex={0}
              line={line}
              columns={[]}
              maxColumns={1}
              textService={textServiceMock}
              activeLine=""
              expandLineLinks
            />
          </tbody>
        </table>
      </TranslationContext.Provider>
    </RowsContext.Provider>
  )
}

function renderLine(language = 'en'): void {
  render(
    <MemoryRouter>
      <LineWithContexts language={language} />
    </MemoryRouter>,
  )
}

it('labels a primary variant that is not the first one', () => {
  renderLine()
  expect(screen.getByText('variant₁:')).toBeVisible()
})

it('labels the other variants in their own cell', () => {
  renderLine()
  expect(screen.getByRole('cell', { name: 'variant₂:' })).toBeVisible()
})

it('links the line number to the chapter', () => {
  renderLine()
  expect(
    screen.getAllByRole('link').map((link) => link.getAttribute('href')),
  ).toContainEqual(expect.stringContaining(chapter.url))
})

it('hides the metrical breaks while the meter is not shown', () => {
  renderLine()
  expect(
    screen.getByText(tokenWithClass('Transliteration__Caesura--hidden', '||')),
  ).toBeInTheDocument()
})

it('shows the translation in the selected language', () => {
  renderLine('en')
  expect(screen.getByText('Line translation')).toBeVisible()
})

it('leaves the translation empty for a language without translation', () => {
  renderLine('fr')
  expect(screen.queryByText('Line translation')).not.toBeInTheDocument()
})
