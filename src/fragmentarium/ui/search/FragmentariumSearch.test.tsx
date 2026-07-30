import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import FragmentService from 'fragmentarium/application/FragmentService'
import BibliographyService from 'bibliography/application/BibliographyService'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult } from 'query/QueryResult'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')

let wordService: jest.Mocked<WordService>
let textService: jest.Mocked<TextService>
let bibliographyService: jest.Mocked<BibliographyService>
let dossiersService: jest.Mocked<DossiersService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let fragmentService: jest.Mocked<FragmentService>
let session: Session

function queryResult(lines = 2, hasNextPage = false): QueryResult {
  const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })
  return {
    items: [
      {
        museumNumber: fragment.number,
        matchingLines: [1, 2],
        matchCount: lines,
        fragment,
        thumbnailPath: null,
      },
    ],
    matchCountTotal: lines,
    hasNextPage,
  }
}

function renderSearch(
  query: Partial<FragmentQuery> = {},
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <FragmentariumSearch
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
            fragmentQuery={query}
            wordService={wordService}
            textService={textService}
            activeTab="library"
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  bibliographyService = new (BibliographyService as jest.Mock<
    jest.Mocked<BibliographyService>
  >)()
  dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  session = new MemorySession(['read:fragments'])
  fragmentService.fetchPeriods.mockResolvedValue([])
  fragmentService.fetchGenres.mockResolvedValue([])
  fragmentService.fetchProvenances.mockResolvedValue([])
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })
  dossiersService.fetchFilteredDossiers.mockResolvedValue([])
  dossiersService.queryByIds.mockResolvedValue([])
  wordService.findAll.mockResolvedValue([])
  textService.query.mockResolvedValue({ items: [], matchCountTotal: 0 })
})

test('renders the empty Library search page without querying results', async () => {
  renderSearch()

  expect(
    await screen.findByText(
      'Search for fragments and chapters in the Library.',
    ),
  ).toBeVisible()
  expect(fragmentService.query).not.toHaveBeenCalled()
})

test('fills in the search form query', async () => {
  fragmentService.query.mockResolvedValue(queryResult())

  renderSearch({ number: 'K.1' })

  expect(await screen.findByLabelText('Number')).toHaveValue('K.1')
})

test('does not refetch on an equivalent query with a new object reference', async () => {
  fragmentService.query.mockResolvedValue(queryResult())
  const transliteration = 'kur'

  const { rerender } = renderSearch({ transliteration })

  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  expect(fragmentService.query).toHaveBeenCalledTimes(1)

  rerender(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <FragmentariumSearch
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
            fragmentQuery={{ transliteration }}
            wordService={wordService}
            textService={textService}
            activeTab="library"
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )

  expect(fragmentService.query).toHaveBeenCalledTimes(1)
})

test('labels inexact line totals without using page size as document total', async () => {
  fragmentService.query.mockResolvedValue({
    ...queryResult(7, true),
    isMatchCountTotalExact: false,
  })

  renderSearch({ transliteration: 'kur' })

  expect(
    await screen.findByText(
      'Found about 7 matching lines. Showing documents 1-1',
    ),
  ).toBeVisible()
  expect(screen.queryByText(/in 1 document/)).not.toBeInTheDocument()
  expect(
    screen.queryByText(/more results are available/),
  ).not.toBeInTheDocument()
})

test('renders summary-backed rows without hydrating the fragment', async () => {
  const result = queryResult(7)
  fragmentService.query.mockResolvedValue(result)

  renderSearch({ lemmas: 'test-lemma' })

  expect(
    await screen.findByText('Found 7 matching lines. Showing documents 1-1'),
  ).toBeVisible()
  expect(fragmentService.find).not.toHaveBeenCalled()
  expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
  expect(screen.getByText(result.items[0].museumNumber)).toBeVisible()
})
