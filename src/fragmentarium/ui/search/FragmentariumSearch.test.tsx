import React from 'react'
import Chance from 'chance'
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
import { CorpusQueryResult, QueryResult } from 'query/QueryResult'
import {
  corpusQueryItemFactory,
  queryItemFactory,
} from 'test-support/query-item-factory'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import userEvent from '@testing-library/user-event'
import { LineDetails } from 'corpus/domain/line-details'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import { queryItemOf } from 'test-support/utils'

const chance = new Chance('fragmentarium-search-test')

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')

let wordService: jest.Mocked<WordService>
let textService: jest.Mocked<TextService>
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
            textService={textService}
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
  textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  session = new MemorySession(['read:fragments'])
  fragmentService.fetchPeriods.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.fetchGenres.mockReturnValueOnce(Promise.resolve([]))
})

describe('Search', () => {
  let fragments: Fragment[]
  describe('Searching fragments by number', () => {
    const museumNumber = 'K.2'

    beforeEach(async () => {
      fragments = fragmentFactory.buildList(2, {}, { transient: { chance } })
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
      textService.query.mockReturnValueOnce(
        Promise.resolve({ items: [], matchCountTotal: 0 })
      )
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

  it('Shows suggestion when entering wrong number format', async () => {
    fragmentService.query.mockReturnValueOnce(
      Promise.resolve({
        items: [],
        matchCountTotal: 0,
      })
    )
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: 0 })
    )
    await renderFragmentariumSearch('K.2', {
      number: 'K 2',
    })

    expect(container).toHaveTextContent('Did you mean K.2?')
  })
})

describe('Searching fragments by transliteration', () => {
  let result: QueryResult
  let corpusResult: CorpusQueryResult
  let fragments: Fragment[]
  let chapters: ChapterDisplay[]
  const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'

  beforeEach(async () => {
    fragments = fragmentFactory.buildList(2, {}, { transient: { chance } })
    chapters = chapterDisplayFactory.buildList(2, {}, { transient: { chance } })
    result = {
      items: fragments.map((fragment) =>
        queryItemFactory.build({
          museumNumber: fragment.number,
        })
      ),
      matchCountTotal: 2,
    }
    corpusResult = {
      items: chapters.map((chapter) =>
        corpusQueryItemFactory.build({
          textId: chapter.id.textId,
          stage: chapter.id.stage,
          name: chapter.id.name,
        })
      ),
      matchCountTotal: 0,
    }
    fragmentService.query.mockReturnValueOnce(Promise.resolve(result))
    textService.query.mockReturnValueOnce(Promise.resolve(corpusResult))
    fragmentService.find
      .mockReturnValueOnce(Promise.resolve(fragments[0]))
      .mockReturnValueOnce(Promise.resolve(fragments[1]))
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.findChapterDisplay
      .mockReturnValueOnce(Promise.resolve(chapters[0]))
      .mockReturnValueOnce(Promise.resolve(chapters[1]))
    textService.findChapterLine.mockReturnValue(
      Promise.resolve(
        new LineDetails(
          [
            lineVariantDisplayFactory.build({
              reconstruction: [],
              manuscripts: [],
            }),
          ],
          0
        )
      )
    )

    await renderFragmentariumSearch(result.items[0].museumNumber, {
      transliteration,
    })
  })
  it('Fills in search form query', () => {
    expect(screen.getByLabelText('Transliteration')).toHaveValue(
      transliteration
    )
  })
  it('Displays Fragmentarium result on successful query', async () => {
    expect(container).toHaveTextContent(result.items[1].museumNumber)
  })
  it('Displays corpus results when clicking corpus tab', async () => {
    userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
    expect(container).toMatchSnapshot()
  })
  it('Updates URL anchor when clicking tab', async () => {
    userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
    expect(global.window.location.hash).toEqual('#corpus')

    userEvent.click(screen.getByRole('tab', { name: 'Fragmentarium' }))
    expect(global.window.location.hash).toEqual('#fragmentarium')
  })
})
