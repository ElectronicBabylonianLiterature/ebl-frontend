import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import TextService from 'corpus/application/TextService'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import { fromLineDto } from 'corpus/application/dtos'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('corpus/application/TextService')

let fragmentSearchService: jest.Mocked<FragmentSearchService>
let textService: jest.Mocked<TextService>
let session: Session
let container: HTMLElement
let element: RenderResult

async function renderFragmentariumSearch(
  waitFor: string,
  {
    number,
    transliteration,
  }: {
    number?: string | null | undefined
    transliteration?: string | null | undefined
  }
): Promise<void> {
  const FragmentariumSearchWithRouter = withRouter<any, any>(
    FragmentariumSearch
  )
  element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <FragmentariumSearchWithRouter
          number={number}
          transliteration={transliteration}
          fragmentSearchService={fragmentSearchService}
          textService={textService}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await element.findByText(waitFor)
  container = element.container
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
      fragments = await factory.buildMany('fragmentInfo', 2)
      fragmentSearchService.searchNumber.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      await renderFragmentariumSearch(fragments[0].number, { number })
    })

    it('Displays result on successfull query', async () => {
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(element.getByLabelText('Number')).toHaveValue(number)
    })
  })

  describe('Searching fragments by transliteration', () => {
    const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'
    const corpusResult = {
      id: {
        category: 1,
        index: 2,
      },
      matchingChapters: [
        {
          id: {
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
        },
      ],
    }

    beforeEach(async () => {
      fragments = await factory.buildMany('fragmentInfo', 2, [
        { matchingLines: [['line 1', 'line 2']] },
        { matchingLines: [['line 3'], ['line 4']] },
      ])
      fragmentSearchService.searchTransliteration.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      textService.searchTransliteration.mockReturnValueOnce(
        Promise.resolve([corpusResult])
      )
      await renderFragmentariumSearch(fragments[0].number, { transliteration })
    })

    it('Fills in search form query', () => {
      expect(element.getByLabelText('Transliteration')).toHaveValue(
        transliteration
      )
    })

    it('Displays Fragmentarium result on successfull query', async () => {
      expect(container).toHaveTextContent(fragments[1].number)
    })

    describe('Corpus results', () => {
      it('Displays text id', async () => {
        expect(await element.findByText('I.2')).toBeVisible()
      })

      it('Displays stage', async () => {
        expect(
          await element.findByText(corpusResult.matchingChapters[0].id.stage)
        ).toBeVisible()
      })

      it('Name links to chapter', async () => {
        expect(
          await element.findByText(corpusResult.matchingChapters[0].id.name)
        ).toHaveAttribute(
          'href',
          `/corpus/${corpusResult.id.category}/${corpusResult.id.index}/${corpusResult.matchingChapters[0].id.stage}/${corpusResult.matchingChapters[0].id.name}`
        )
      })

      it('Displays matching reconstruction', async () => {
        expect(await element.findByText(/1\. %n ra/)).toBeVisible()
      })

      it('Displays matching manuscript', async () => {
        expect(
          await element.findByText(/NinSchb o iii a\+1\. ra/)
        ).toBeVisible()
      })

      it('Displays matching colophon', async () => {
        expect(await element.findByText(/1\. kur/)).toBeVisible()
      })
    })
  })
})
