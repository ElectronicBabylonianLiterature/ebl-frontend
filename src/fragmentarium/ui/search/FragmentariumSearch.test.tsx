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
import { fromLineDto } from 'corpus/application/dtos'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import textLineFixture from 'test-support/lines/text-line'

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
    paginationIndex = 0,
  }: {
    number?: string | null | undefined
    transliteration?: string | null | undefined
    paginationIndex?: number
  }
): Promise<void> {
  const FragmentariumSearchWithRouter = withRouter<any, any>(
    FragmentariumSearch
  )
  container = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <FragmentariumSearchWithRouter
          number={number}
          transliteration={transliteration}
          paginationIndex={paginationIndex}
          fragmentSearchService={fragmentSearchService}
          textService={textService}
          wordService={wordService}
        />
      </SessionContext.Provider>
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
      await renderFragmentariumSearch(fragments[0].number, { number })
    })

    it('Displays result on successfull query', async () => {
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(screen.getByLabelText('Number')).toHaveValue(number)
    })
  })

  describe('Searching fragments by transliteration', () => {
    const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'
    const corpusResult = {
      id: {
        textId: {
          genre: 'L',
          category: 1,
          index: 2,
        },
        stage: 'Old Babyblonian',
        name: 'My Chapter',
      },
      siglums: { '1': 'NinSchb' },
      matchingLines: [
        fromLineDto({
          number: '1',
          isBeginningOfSection: false,
          isSecondLineOfParallelism: false,
          variants: [
            {
              reconstruction: '%n ra',
              manuscripts: [
                {
                  manuscriptId: 1,
                  labels: ['o', 'iii'],
                  number: 'a+1',
                  atf: 'ra',
                  omittedWords: [],
                },
              ],
            },
          ],
        }),
      ],
      matchingColophonLines: {
        '1': ['1. kur'],
      },
    }

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
        Promise.resolve([corpusResult])
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

    describe('Corpus results', () => {
      it('Displays text id', async () => {
        expect(await screen.findByText('L I.2')).toBeVisible()
      })

      it('Name links to chapter', async () => {
        expect(
          await screen.findByText(
            `${corpusResult.id.stage} ${corpusResult.id.name}`
          )
        ).toHaveAttribute(
          'href',
          `/corpus/${corpusResult.id.textId.genre}/${corpusResult.id.textId.category}/${corpusResult.id.textId.index}/${corpusResult.id.stage}/${corpusResult.id.name}`
        )
      })

      it('Displays matching reconstruction', async () => {
        expect(await screen.findByText(/1\. %n ra/)).toBeVisible()
      })

      it('Displays matching manuscript', async () => {
        expect(await screen.findByText(/NinSchb o iii a\+1\. ra/)).toBeVisible()
      })

      it('Displays matching colophon', async () => {
        expect(await screen.findByText(/1\. kur/)).toBeVisible()
      })
    })
  })
})
