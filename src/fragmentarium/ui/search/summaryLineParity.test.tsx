import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { createQueryResult } from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { createTransliteration } from 'transliteration/application/dtos'
import {
  scholarlyPreviewLine,
  SUMMARY_LEMMA_ID,
  tokenWithClass,
} from 'test-support/fragment-query-preview'
import { fragmentDto } from 'test-support/test-fragment'

jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

function renderLines(fragment: Fragment): void {
  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <RenderFragmentLines
          fragment={fragment}
          linesToShow={5}
          totalLines={1}
          lemmaIds={[SUMMARY_LEMMA_ID]}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

function summaryQueryItemFragment(): Fragment {
  const result = createQueryResult({
    matchCountTotal: 1,
    items: [
      {
        museumNumber: fragmentDto.museumNumber,
        accession: null,
        description: 'summary',
        script: { ...fragmentDto.script, period: 'LB' },
        matchingLines: [1],
        matchingLinePreview: { lines: [scholarlyPreviewLine] },
        matchCount: 1,
        hasPhoto: false,
      },
    ],
  })
  return result.items[0].fragment as Fragment
}

function masterFragment(): Fragment {
  return Fragment.create({
    ...fragmentFactory.build(),
    text: createTransliteration({ lines: [scholarlyPreviewLine] }),
  })
}

describe('summary line rendering parity with the full-fragment path', () => {
  it('produces the same scholarly DOM from a summary DTO as from a full fragment', () => {
    renderLines(summaryQueryItemFragment())
    renderLines(masterFragment())

    const [summaryTable, masterTable] = screen.getAllByRole('table')

    expect(summaryTable.innerHTML).toEqual(masterTable.innerHTML)
  })

  it.each([
    ['reading', 'kur', 'Transliteration__Reading'],
    ['logogram', 'INANNA', 'Transliteration__Logogram'],
    ['determinative', '.d', 'Transliteration__Determinative'],
  ])(
    'renders a %s through the master token components',
    (_name, text, className) => {
      renderLines(summaryQueryItemFragment())

      expect(
        screen.getByText(tokenWithClass(className, text)),
      ).toBeInTheDocument()
    },
  )

  it('renders determinatives as superscripts', () => {
    renderLines(summaryQueryItemFragment())

    expect(
      screen.getByText(tokenWithClass('Transliteration__glossJoiner', '.')),
    ).toBeInTheDocument()
    expect(screen.getAllByText('d').length).toBeGreaterThan(0)
  })

  it('renders damage brackets for flagged signs', () => {
    renderLines(summaryQueryItemFragment())

    expect(screen.getAllByText('⸢').length).toBeGreaterThan(0)
    expect(screen.getAllByText('⸣').length).toBeGreaterThan(0)
  })

  it('puts the lemma highlight on the same token element as the full path', () => {
    renderLines(summaryQueryItemFragment())

    expect(
      screen.getByText(
        tokenWithClass('Transliteration__Word--highlight', 'kur'),
      ),
    ).toBeInTheDocument()
  })

  it('renders the line number through the master formatter', () => {
    renderLines(summaryQueryItemFragment())

    expect(screen.getByText('1')).toBeVisible()
  })
})
