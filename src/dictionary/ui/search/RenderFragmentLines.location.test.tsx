/* eslint-disable camelcase */
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { fragmentDto } from 'test-support/test-fragment'
import { createTransliteration } from 'transliteration/application/dtos'
import { createQueryResult } from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { previewLine, readingWord } from 'test-support/fragment-query-preview'
import { TextLineDto, TextLineLocation } from 'transliteration/domain/text-line'
import { LineNumber } from 'transliteration/domain/line-number'

jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

function location(
  surface: string | null,
  column: string | null = null,
): TextLineLocation {
  return { object: null, surface, column, sealNumber: null }
}

function renderLines(fragment: Fragment): void {
  render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <RenderFragmentLines fragment={fragment} linesToShow={5} />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

function fullFragment(lines: readonly TextLineDto[]): Fragment {
  return Fragment.create({
    ...fragmentFactory.build(),
    text: createTransliteration({ lines }),
  })
}

describe('scholarly matching-line locations', () => {
  it('keeps individual preview locations and original indexes through DTO mapping', () => {
    const first = {
      ...previewLine(6, [readingWord]),
      index: 2,
      location: location('o', 'ii'),
    }
    const second = {
      ...previewLine(6, [readingWord]),
      index: 8,
      location: location('r', 'iii'),
    }
    const queryItem = createQueryResult({
      matchCountTotal: 2,
      items: [
        {
          museumNumber: fragmentDto.museumNumber,
          description: 'summary',
          script: { ...fragmentDto.script, period: 'LB' },
          matchingLines: [2, 8],
          matchingLinePreview: { lines: [first, second] },
          matchCount: 2,
          hasPhoto: false,
        },
      ],
    }).items[0]

    expect(queryItem.fragment?.text.lines).toEqual([
      expect.objectContaining({ index: 2, location: first.location }),
      expect.objectContaining({ index: 8, location: second.location }),
    ])
    renderLines(queryItem.fragment as Fragment)

    const labels = screen
      .getAllByRole('cell')
      .filter((cell) =>
        cell.classList.contains('fragment-lines-with-lemma__line-number'),
      )
    expect(labels.map((cell) => cell.textContent)).toEqual([
      'o. ii 6',
      'r. iii 6',
    ])
    expect(screen.getByRole('link', { name: 'o. ii 6' })).toHaveAttribute(
      'href',
      expect.stringContaining('#o%20ii%206'),
    )
    expect(screen.getByRole('link', { name: 'r. iii 6' })).toHaveAttribute(
      'href',
      expect.stringContaining('#r%20iii%206'),
    )
  })

  it('preserves uncertainty, primes, and ranges without duplicate punctuation', () => {
    const start: LineNumber = {
      number: 6,
      hasPrime: true,
      prefixModifier: null,
      suffixModifier: null,
    }
    const end: LineNumber = { ...start, number: 8, hasPrime: false }
    const line = {
      ...previewLine(6, [readingWord]),
      lineNumber: { type: 'LineNumberRange' as const, start, end },
      location: location('o?', 'ii?'),
    }
    renderLines(fullFragment([line]))

    expect(screen.getByText('o?. ii? 6′–8')).toBeVisible()
    expect(screen.getByText('kur')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'o?. ii? 6′–8' })).toHaveAttribute(
      'href',
      expect.stringContaining("#o%3F%20ii%3F%206'-8"),
    )
  })

  it('omits missing labels and keeps the legacy hydrated line number', () => {
    renderLines(
      fullFragment([
        { ...previewLine(4, []), location: location(null, 'ii') },
        { ...previewLine(6, []), location: location(null) },
        previewLine(7, []),
      ]),
    )

    const rows = screen.getAllByRole('row')
    expect(within(rows[0]).getByText('ii 4')).toBeVisible()
    expect(within(rows[1]).getByText('6')).toBeVisible()
    expect(within(rows[2]).getByText('7')).toBeVisible()
    expect(within(rows[2]).queryByRole('link')).not.toBeInTheDocument()
  })

  it('derives locations from structural markers in full hydrated fragments', () => {
    const surface = {
      type: 'SurfaceAtLine',
      prefix: '@',
      displayValue: 'obverse',
      content: [],
      surface_label: {
        surface: 'OBVERSE',
        text: 'obverse',
        abbreviation: 'o',
        status: [],
      },
    } as const
    const column = {
      type: 'ColumnAtLine',
      prefix: '@',
      displayValue: 'column ii',
      content: [],
      column_label: { column: 2, abbreviation: 'ii', status: [] },
    } as const
    const fragment = Fragment.create({
      ...fragmentFactory.build(),
      text: createTransliteration({
        lines: [surface, column, previewLine(6, [])],
      }),
    })
    renderLines(fragment)

    expect(screen.getByText('o. ii 6')).toBeVisible()
  })
})
