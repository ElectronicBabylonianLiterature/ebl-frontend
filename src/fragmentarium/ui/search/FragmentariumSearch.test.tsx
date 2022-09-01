import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import TextService from 'corpus/application/TextService'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import textLineFixture from 'test-support/lines/text-line'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('corpus/application/TextService')
jest.mock('dictionary/application/WordService')

const wordService = new (WordService as jest.Mock<WordService>)()

let fragmentSearchService: jest.Mocked<FragmentSearchService>
let textService: jest.Mocked<TextService>
let session: Session
let container: HTMLElement

async function renderFragmentariumSearch(
  waitFor: string,
  {
    number,
    transliteration,
  }: {
    number?: string | null | undefined
    transliteration?: string | null | undefined
  }
): Promise<any> {
  const FragmentariumSearchWithRouter = withRouter<any, any>(
    FragmentariumSearch
  )
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <FragmentariumSearchWithRouter
            number={number}
            transliteration={transliteration}
            paginationIndexFragmentarium={0}
            paginationIndexCorpus={0}
            fragmentSearchService={fragmentSearchService}
            textService={textService}
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
  textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
  session = new MemorySession(['read:fragments'])
})

describe('Search', () => {
  let fragments: FragmentInfo[]
  describe('Searching fragments by number', () => {
    const number = 'K.2'

    beforeEach(async () => {
      fragments = fragmentInfoFactory.buildList(2)
      fragmentSearchService.searchFragmentarium.mockReturnValueOnce(
        Promise.resolve({ fragmentInfos: fragments, totalCount: 2 })
      )
      textService.searchTransliteration.mockReturnValueOnce(
        Promise.resolve({ chapterInfos: [], totalCount: 0 })
      )
      await renderFragmentariumSearch(fragments[0].number, { number })
    })

    it('Displays result on successfull query', async () => {
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(screen.getByLabelText('Number')).toHaveValue(number)
    })
  })
})

describe('Searching fragments by transliteration', () => {
  let fragments
  const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'

  const matchingLineTestTextFixture = new Text({
    lines: [textLineFixture],
  })

  beforeEach(async () => {
    fragments = [
      fragmentInfoFactory.build({
        matchingLines: matchingLineTestTextFixture,
      }),
      fragmentInfoFactory.build({
        matchingLines: matchingLineTestTextFixture,
      }),
    ]
    fragmentSearchService.searchFragmentarium.mockReturnValueOnce(
      Promise.resolve({ fragmentInfos: fragments, totalCount: 2 })
    )
    textService.searchTransliteration.mockReturnValueOnce(
      Promise.resolve({ chapterInfos: [], totalCount: 1 })
    )
    await renderFragmentariumSearch(fragments[0].number, { transliteration })
  })

  it('Fills in search form query', () => {
    expect(screen.getByLabelText('Transliteration')).toHaveValue(
      transliteration
    )
  })
  it('Displays Fragmentarium result on successfull query', async () => {
    expect(container).toHaveTextContent(fragments[1].number)
  })
})
