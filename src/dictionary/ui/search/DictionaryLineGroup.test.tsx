import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, within } from '@testing-library/react'
import { castDraft, produce } from 'immer'
import DictionaryLineGroup from 'dictionary/ui/search/DictionaryLineGroup'
import {
  dictionaryLineDisplayFactory,
  lineVariantDisplayFactory,
} from 'test-support/dictionary-line-fixtures'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import { implicitFirstColumn } from 'test-support/lines/text-columns'
import { LineDetails } from 'corpus/domain/line-details'
import { EmptyLine } from 'transliteration/domain/line'
import { ManuscriptTypes } from 'corpus/domain/manuscript'

const parallelManuscript = manuscriptLineDisplayFactory.build(
  {},
  {
    associations: { line: implicitFirstColumn, type: ManuscriptTypes.Parallel },
  },
)
const emptyManuscript = manuscriptLineDisplayFactory.build(
  {},
  { associations: { line: new EmptyLine() } },
)
const dictionaryLine = dictionaryLineDisplayFactory.build(
  {},
  {
    associations: {
      lineDetails: new LineDetails(
        [
          lineVariantDisplayFactory.build({
            reconstruction: [],
            manuscripts: [parallelManuscript, emptyManuscript],
          }),
        ],
        0,
      ),
    },
  },
)

function showGroup(): void {
  render(
    <MemoryRouter>
      <table>
        <tbody>
          <DictionaryLineGroup lines={[dictionaryLine]} lemmaId="ušurtu I" />
        </tbody>
      </table>
    </MemoryRouter>,
  )
}

function rowContaining(text: string): HTMLElement {
  const [row] = screen
    .getAllByRole('row')
    .filter((candidate) => candidate.textContent?.includes(text))
  return row
}

function translationText(language: string): string {
  return dictionaryLine.line.translation
    .filter((translation) => translation.language === language)
    .flatMap((translation) => translation.parts)
    .map((part) => ('text' in part ? part.text : ''))
    .join('')
}

test('shows a row for each manuscript of the variant', () => {
  showGroup()

  const parallelRow = rowContaining(parallelManuscript.siglum)
  expect(parallelRow).toHaveTextContent(`// ${parallelManuscript.siglum}`)
  expect(parallelRow).toHaveTextContent('kur')
  const emptyCells = within(rowContaining(emptyManuscript.siglum)).getAllByRole(
    'cell',
  )
  expect(emptyCells).toHaveLength(2)
  expect(emptyCells[1]).toBeEmptyDOMElement()
  expect(emptyCells[1]).toHaveAttribute('colspan')
})

test('shows only the English translation of the line', () => {
  showGroup()

  expect(screen.getByText(translationText('en'))).toBeInTheDocument()
  expect(screen.queryByText(translationText('de'))).not.toBeInTheDocument()
})

test('numbers the further variants of a line', () => {
  const [variant] = dictionaryLine.line.variants
  const lineWithVariant = produce(dictionaryLine, (draft) => {
    draft.line.variants.push(castDraft(variant))
    draft.lineDetails = castDraft(
      new LineDetails(
        [
          lineVariantDisplayFactory.build({ manuscripts: [] }),
          lineVariantDisplayFactory.build({ manuscripts: [] }),
        ],
        0,
      ),
    )
  })

  render(
    <MemoryRouter>
      <table>
        <tbody>
          <DictionaryLineGroup lines={[lineWithVariant]} lemmaId="ušurtu I" />
        </tbody>
      </table>
    </MemoryRouter>,
  )

  expect(screen.getByText(/variant₁:/)).toBeInTheDocument()
})
