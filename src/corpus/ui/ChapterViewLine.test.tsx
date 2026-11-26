import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LineDetails } from 'corpus/domain/line-details'
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

function LineWithContexts({
  language,
  displayLine,
}: {
  language: string
  displayLine: LineDisplay
}): JSX.Element {
  return (
    <RowsContext.Provider value={useRowsContext(1)}>
      <TranslationContext.Provider value={useTranslationContext(language)}>
        <table>
          <tbody>
            <ChapterViewLine
              chapter={chapter}
              lineIndex={0}
              line={displayLine}
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

function renderLine(language = 'en', displayLine = line): void {
  render(
    <MemoryRouter>
      <LineWithContexts language={language} displayLine={displayLine} />
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

function controlledRow(toggle: HTMLElement): HTMLElement | undefined {
  return screen
    .getAllByRole('row', { hidden: true })
    .find(
      (row) => row.getAttribute('id') === toggle.getAttribute('aria-controls'),
    )
}

it.each(['Show score', 'Show notes', 'Show parallels'])(
  'opens and closes %s with the keyboard and pointer',
  async (name) => {
    textServiceMock.findChapterLine.mockResolvedValue(new LineDetails([], 0))
    renderLine()
    const toggle = screen.getAllByRole('button', { name })[0]
    expect(toggle.tagName).toBe('BUTTON')
    expect(toggle).toHaveAttribute('type', 'button')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    for (let index = 0; index < 12 && !toggle.matches(':focus'); index++) {
      await userEvent.tab()
    }
    expect(toggle).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveFocus()
    const expandedTarget = controlledRow(toggle)
    expect(expandedTarget).toBeInTheDocument()
    await waitFor(() => expect(expandedTarget).toHaveClass('show'))
    await userEvent.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(controlledRow(toggle)).toBeInTheDocument()
  },
)

it('omits empty detail controls and the secondary variant score control', () => {
  renderLine('en', {
    ...line,
    variants: line.variants.map((variant) => ({
      ...variant,
      note: null,
      parallelLines: [],
    })),
  })
  expect(
    screen.queryByRole('button', { name: 'Show notes' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Show parallels' }),
  ).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Show score' })).toHaveLength(1)
})
