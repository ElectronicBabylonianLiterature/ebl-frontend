import { screen } from '@testing-library/react'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { QueryResult } from 'query/QueryResult'
import {
  createFragmentariumSearchTestContext,
  FragmentariumSearchTestContext,
} from 'fragmentarium/ui/search/FragmentariumSearch.testSupport'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')

let context: FragmentariumSearchTestContext

beforeEach(() => {
  context = createFragmentariumSearchTestContext()
})

describe('Search result contract compatibility', () => {
  const transliteration = 'kur'

  async function renderLibraryResult(result: QueryResult): Promise<void> {
    const { fragmentService, wordService, textService } = context
    fragmentService.query.mockReturnValueOnce(Promise.resolve(result))
    textService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: 0 }),
    )
    wordService.findAll.mockReturnValue(Promise.resolve([]))

    await context.renderSearch(
      result.matchCountTotal === null
        ? `Found ${result.items.length} document${
            result.items.length === 1 ? '' : 's'
          }`
        : `Found about ${result.matchCountTotal} lines in ${
            result.items.length
          } document${
            result.items.length === 1 ? '' : 's'
          }; more results are available`,
      { transliteration },
    )
  }

  it('renders Fragmentarium results when matchCountTotal is null', async () => {
    const resultFragment = fragmentFactory.build({
      hasPhoto: false,
      dossiers: [],
    })

    await renderLibraryResult({
      items: [
        {
          museumNumber: resultFragment.number,
          matchingLines: [1],
          matchCount: 1,
          fragment: resultFragment,
          thumbnailPath: null,
        },
      ],
      matchCountTotal: null,
    })

    expect(screen.getByText('Found 1 document')).toBeVisible()
    expect(
      screen.queryByText('Found 0 lines in 1 document'),
    ).not.toBeInTheDocument()
  })

  it('labels inexact totals and incomplete pages', async () => {
    const resultFragment = fragmentFactory.build({
      hasPhoto: false,
      dossiers: [],
    })

    await renderLibraryResult({
      items: [
        {
          museumNumber: resultFragment.number,
          matchingLines: [1],
          matchCount: 1,
          fragment: resultFragment,
          thumbnailPath: null,
        },
      ],
      matchCountTotal: 7,
      isMatchCountTotalExact: false,
      hasNextPage: true,
    })

    expect(
      screen.getByText(
        'Found about 7 lines in 1 document; more results are available',
      ),
    ).toBeVisible()
  })

  it('renders corpus results when matchCountTotal is null', async () => {
    const { fragmentService, wordService, textService } = context
    fragmentService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: null }),
    )
    textService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: null }),
    )
    wordService.findAll.mockReturnValue(Promise.resolve([]))

    await context.renderSearch(
      'Found 0 chapters',
      { transliteration },
      'corpus',
    )

    expect(screen.getByText('Found 0 chapters')).toBeVisible()
    expect(screen.queryByText(/Found 0 lines/)).not.toBeInTheDocument()
  })
})
