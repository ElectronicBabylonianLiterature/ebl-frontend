import { render, screen } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { QueryResult } from 'query/QueryResult'
import { queryItemOf } from 'test-support/utils'
import {
  chance,
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

describe('Search', () => {
  let fragments: Fragment[]

  describe('Searching fragments by number', () => {
    const museumNumber = 'K.2'

    async function setupSearchByNumber(): Promise<void> {
      const { fragmentService, wordService, textService } = context
      fragments = fragmentFactory.buildList(2, {}, { transient: { chance } })
      fragmentService.query.mockReturnValueOnce(
        Promise.resolve({
          items: fragments.map(queryItemOf),
          matchCountTotal: 0,
        }),
      )
      fragmentService.find
        .mockReturnValueOnce(Promise.resolve(fragments[0]))
        .mockReturnValueOnce(Promise.resolve(fragments[1]))
      wordService.findAll.mockReturnValue(Promise.resolve([]))
      textService.query.mockReturnValueOnce(
        Promise.resolve({ items: [], matchCountTotal: 0 }),
      )
      await context.renderSearch(fragments[0].number, {
        number: museumNumber,
      })
    }

    it('Displays result on successful query', async () => {
      await setupSearchByNumber()
      expect(context.container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', async () => {
      await setupSearchByNumber()
      expect(screen.getByLabelText('Number')).toHaveValue(museumNumber)
    })
  })

  it('Does not refetch on equivalent query with new object reference', async () => {
    const { fragmentService, wordService, textService, createSearch } = context
    const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'
    const fragments = fragmentFactory.buildList(
      2,
      {},
      { transient: { chance } },
    )
    const result: QueryResult = {
      items: fragments.map(queryItemOf),
      matchCountTotal: 2,
    }

    fragmentService.query.mockResolvedValue(result)
    fragmentService.find.mockResolvedValue(fragments[0])
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.query.mockReturnValue(
      Promise.resolve({ items: [], matchCountTotal: 0 }),
    )

    const { rerender } = render(createSearch({ transliteration }))

    await screen.findByText('Found 2 lines in 2 documents')
    expect(fragmentService.query).toHaveBeenCalledTimes(1)

    rerender(createSearch({ transliteration }))

    expect(fragmentService.query).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Found 2 lines in 2 documents')).toBeVisible()

    const differentResult: QueryResult = {
      items: [
        {
          museumNumber: fragments[0].number,
          matchingLines: [],
          matchCount: 0,
        },
      ],
      matchCountTotal: 5,
    }
    fragmentService.query.mockResolvedValue(differentResult)

    rerender(createSearch({ transliteration: 'different text' }))

    await screen.findByText('Found 5 lines in 1 document')
    expect(fragmentService.query).toHaveBeenCalledTimes(2)
  })

  it('Shows suggestion when entering wrong number format', async () => {
    const { fragmentService, wordService, textService } = context
    fragmentService.query.mockReturnValueOnce(
      Promise.resolve({
        items: [],
        matchCountTotal: 0,
      }),
    )
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: 0 }),
    )
    await context.renderSearch('K.2', {
      number: 'K 2',
    })

    expect(context.container).toMatchSnapshot()
    expect(context.container).toHaveTextContent('Did you mean K.2?')
  })
})
