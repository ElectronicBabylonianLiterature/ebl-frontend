import React from 'react'
import { Router } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Promise from 'bluebird'
import Bluebird from 'bluebird'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import TextService from 'corpus/application/TextService'
import { fromLineDto } from 'corpus/application/dtos'
import WordService from 'dictionary/application/WordService'
import textLineFixture from 'test-support/lines/text-line'
import { stageToAbbreviation } from 'corpus/domain/period'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import CorpusTransliterationSearch from 'corpus/ui/TransliterationSearch'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, MemoryHistory } from 'history'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('corpus/application/TextService')
jest.mock('dictionary/application/WordService')

let history: MemoryHistory

const wordService = new (WordService as jest.Mock<WordService>)()
const session: Session = new MemorySession(['read:fragments'])
let container: HTMLElement

const corpusResult = {
  id: {
    textId: {
      genre: 'L',
      category: 1,
      index: 2,
    },
    stage: 'Old Babylonian',
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
    '1': [textLineFixture],
  },
}
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

async function renderCorpusSearch(transliteration = 'test') {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const container = render(
    <Router history={history}>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <CorpusTransliterationSearch
            paginationIndex={0}
            transliteration={transliteration}
            textService={textService}
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </Router>
  ).container
  await waitForSpinnerToBeRemoved(screen)
  return container
}

describe('Corpus results', () => {
  beforeEach(async () => {
    textService.searchTransliteration.mockReturnValue(
      Promise.resolve({ chapterInfos: [corpusResult], totalCount: 1 })
    )
    container = await renderCorpusSearch()
  })

  it('Match Snapshot', () => {
    expect(container).toMatchSnapshot()
  })

  it('Name links to chapter', async () => {
    expect(
      await screen.findByText(
        `${corpusResult.id.stage} ${corpusResult.id.name}`
      )
    ).toHaveAttribute(
      'href',
      `/corpus/${corpusResult.id.textId.genre}/${
        corpusResult.id.textId.category
      }/${corpusResult.id.textId.index}/${stageToAbbreviation(
        corpusResult.id.stage
      )}/${corpusResult.id.name}`
    )
  })
})

const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'
const TOTAL_COUNT = 2
describe('test scrolling through pagination', () => {
  beforeEach(async () => {
    textService.searchTransliteration
      .mockReturnValueOnce(
        Bluebird.resolve({
          chapterInfos: [corpusResult],
          totalCount: TOTAL_COUNT,
        })
      )
      .mockReturnValueOnce(
        Bluebird.resolve({
          chapterInfos: [
            {
              ...corpusResult,
              id: {
                textId: {
                  genre: 'L',
                  category: 1,
                  index: 3,
                },
                stage: 'Old Babylonian',
                name: 'My Chapter',
              },
            },
          ],
          totalCount: TOTAL_COUNT,
        })
      )
    await renderCorpusSearch(transliteration)
  })
  it('Inital Render', async () => {
    await waitFor(() =>
      expect(textService.searchTransliteration).toBeCalledWith(
        transliteration,
        0
      )
    )
    await screen.findByText(/L.I.2/)
  })
  it('Next Page', async () => {
    userEvent.click(screen.getByText('2'))
    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith({
        search: 'paginationIndexCorpus=1',
      })
    )
    await waitFor(() =>
      expect(textService.searchTransliteration).toBeCalledWith(
        transliteration,
        1
      )
    )
    await screen.findByText(/L.I.3/)
    expect(screen.queryByText(/L.I.2/)).not.toBeInTheDocument()
  })
})
