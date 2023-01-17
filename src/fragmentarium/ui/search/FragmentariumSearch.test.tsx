import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryItem, QueryResult } from 'query/QueryResult'
import MuseumNumber, {
  museumNumberToString,
} from 'fragmentarium/domain/MuseumNumber'
import { queryItemFactory } from 'test-support/query-item-factory'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')

let wordService: jest.Mocked<WordService>
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

let fragmentSearchService: jest.Mocked<FragmentSearchService>
let session: Session
let container: HTMLElement

async function renderFragmentariumSearch(
  waitFor: string,
  query: FragmentQuery
): Promise<void> {
  const FragmentariumSearchWithRouter = withRouter<any, any>(
    FragmentariumSearch
  )
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <FragmentariumSearchWithRouter
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            fragmentQuery={query}
            wordService={wordService}
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>
  ).container
  await screen.findByText(waitFor)
}

beforeEach(async () => {
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  session = new MemorySession(['read:fragments'])
})

function parseMuseumNumber(museumNumber: string): MuseumNumber {
  const parts = museumNumber.split('.')
  return {
    prefix: parts[0],
    number: parts[1],
    suffix: parts.length === 3 ? parts[2] : '',
  }
}

function queryItemOf(fragment: Fragment): QueryItem {
  return {
    museumNumber: parseMuseumNumber(fragment.number),
    matchingLines: [],
    matchCount: 0,
  }
}

describe('Search', () => {
  let fragments: Fragment[]
  describe('Searching fragments by number', () => {
    const museumNumber = 'K.2'

    beforeEach(async () => {
      fragments = fragmentFactory.buildList(2)
      fragmentService.query.mockReturnValueOnce(
        Promise.resolve({
          items: fragments.map(queryItemOf),
          matchCountTotal: 0,
        })
      )
      fragmentService.find
        .mockReturnValueOnce(Promise.resolve(fragments[0]))
        .mockReturnValueOnce(Promise.resolve(fragments[1]))
      wordService.findAll.mockReturnValue(Promise.resolve([]))
      await renderFragmentariumSearch(fragments[0].number, {
        number: museumNumber,
      })
    })

    it('Displays result on successful query', async () => {
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(screen.getByLabelText('Number')).toHaveValue(museumNumber)
    })
  })
})

describe('Searching fragments by transliteration', () => {
  let result: QueryResult
  let fragments: Fragment[]
  const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'

  beforeEach(async () => {
    fragments = fragmentFactory.buildList(2)
    result = {
      items: fragments.map((fragment) =>
        queryItemFactory.build({
          museumNumber: parseMuseumNumber(fragment.number),
        })
      ),
      matchCountTotal: 2,
    }
    fragmentService.query.mockReturnValueOnce(Promise.resolve(result))
    fragmentService.find
      .mockReturnValueOnce(Promise.resolve(fragments[0]))
      .mockReturnValueOnce(Promise.resolve(fragments[1]))
    wordService.findAll.mockReturnValue(Promise.resolve([]))

    await renderFragmentariumSearch(
      museumNumberToString(result.items[0].museumNumber),
      { transliteration }
    )
  })
  it('Fills in search form query', () => {
    expect(screen.getByLabelText('Transliteration')).toHaveValue(
      transliteration
    )
  })
  it('Displays Fragmentarium result on successful query', async () => {
    expect(container).toHaveTextContent(
      museumNumberToString(result.items[1].museumNumber)
    )
  })
})
