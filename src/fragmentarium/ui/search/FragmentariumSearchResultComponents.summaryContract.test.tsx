import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import { createQueryResult } from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { createSummaryItemDto } from 'fragmentarium/infrastructure/fragmentRepository.testSupport'
import { QueryItem } from 'query/QueryResult'
import { fragmentDto } from 'test-support/test-fragment'
import mockObjectUrl from 'test-support/mockObjectUrl'
import ErrorReporterContext from 'ErrorReporterContext'
import { silenceConsoleErrors } from 'setupTests'
import {
  previewLine,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import { Token } from 'transliteration/domain/token'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLines } from './FragmentariumSearchResultComponents'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

mockObjectUrl('blob:url')

beforeEach(() => {
  jest.clearAllMocks()
  dossiersService.queryByIds.mockResolvedValue([])
  fragmentService.find.mockReturnValue(new Promise(() => undefined) as never)
})

function mapItems(
  items: readonly Record<string, unknown>[],
): readonly QueryItem[] {
  return createQueryResult({
    items: items as never,
    matchCountTotal: items.length,
  }).items
}

const errorReporter = {
  captureException: jest.fn(),
  showReportDialog: jest.fn(),
  setUser: jest.fn(),
  clearScope: jest.fn(),
}

function renderCards(queryItems: readonly QueryItem[]): void {
  render(
    <MemoryRouter>
      <ErrorReporterContext.Provider value={errorReporter}>
        <DictionaryContext.Provider value={wordService}>
          {queryItems.map((queryItem, index) => (
            <FragmentLines
              key={index}
              fragmentService={fragmentService}
              dossiersService={dossiersService}
              queryItem={queryItem}
              linesToShow={3}
            />
          ))}
        </DictionaryContext.Provider>
      </ErrorReporterContext.Provider>
    </MemoryRouter>,
  )
}

function summaryItemDto(index: number): Record<string, unknown> {
  return createSummaryItemDto({
    museumNumber: { prefix: 'Summary', number: String(index), suffix: '' },
    hasPhoto: false,
    dossiers: [],
  })
}

describe('summary contract guardrail', () => {
  it('renders fifty mapper-produced summary cards with zero hydration', () => {
    const queryItems = mapItems(
      Array.from({ length: 50 }, (unused, index) => summaryItemDto(index + 1)),
    )

    renderCards(queryItems)

    expect(screen.getAllByText(/^Summary\.\d+$/)).toHaveLength(50)
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
  })

  it('shows an unavailable card for drifted summaries instead of hydrating', () => {
    const driftedItems = Array.from({ length: 50 }, (unused, index) => {
      const itemDto = summaryItemDto(index + 1)
      delete itemDto.description
      return itemDto
    })

    renderCards(mapItems(driftedItems))

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(
      screen.getAllByText('Details for this result are unavailable.'),
    ).toHaveLength(50)
    expect(screen.getByRole('link', { name: 'Summary.1' })).toHaveAttribute(
      'href',
      '/library/Summary.1',
    )
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
  })

  it('contains a card rendering failure without losing sibling cards', () => {
    silenceConsoleErrors()
    const [first, broken, last] = mapItems([
      summaryItemDto(1),
      summaryItemDto(2),
      summaryItemDto(3),
    ])
    const crashingToken = {
      type: 'Variant',
      value: 'kur',
      cleanValue: 'kur',
      enclosureType: [],
    } as unknown as Token

    renderCards([
      first,
      {
        ...broken,
        fragment: withPreviewLines(broken.fragment as Fragment, [
          previewLine(1, [crashingToken]),
        ]),
      },
      last,
    ])

    expect(screen.getByRole('link', { name: 'Summary.1' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Summary.3' })).toBeInTheDocument()
    expect(
      screen.getByText('Details for this result are unavailable.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/gone wrong/)).not.toBeInTheDocument()
    expect(errorReporter.captureException).toHaveBeenCalledTimes(1)
    expect(fragmentService.find).not.toHaveBeenCalled()
  })

  it('still hydrates genuinely legacy items', () => {
    renderCards(
      mapItems([
        {
          museumNumber: fragmentDto.museumNumber,
          matchingLines: [1, 2],
          matchCount: 2,
        },
      ]),
    )

    expect(fragmentService.find).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Spinner')).toBeInTheDocument()
  })
})
