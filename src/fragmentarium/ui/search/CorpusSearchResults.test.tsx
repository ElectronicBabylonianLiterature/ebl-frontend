import React from 'react'
import { Router } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Bluebird from 'bluebird'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import CorpusTransliterationSearch from 'corpus/ui/TransliterationSearch'
import WordService from 'dictionary/application/WordService'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, MemoryHistory } from 'history'
import TextService from 'corpus/application/TextService'
import { fromLineDto } from 'corpus/application/dtos'
import textLineFixture from 'test-support/lines/text-line'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

let history: MemoryHistory

jest.mock('corpus/application/TextService')
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

jest.mock('dictionary/application/WordService')
const wordService = new (WordService as jest.Mock<WordService>)()

function renderCorpusSearchResults(transliteration) {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  return render(
    <DictionaryContext.Provider value={wordService}>
      <Router history={history}>
        <CorpusTransliterationSearch
          paginationIndex={0}
          transliteration={transliteration}
          textService={textService}
        />
      </Router>
    </DictionaryContext.Provider>
  )
}

const transliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'
const TOTAL_COUNT = 2
describe('test scrolling through pagination', () => {
  beforeEach(async () => {
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
    renderCorpusSearchResults(transliteration)
    await waitForSpinnerToBeRemoved(screen)
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
