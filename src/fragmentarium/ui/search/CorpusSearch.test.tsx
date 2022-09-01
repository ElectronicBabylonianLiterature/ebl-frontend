import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
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

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('corpus/application/TextService')
jest.mock('dictionary/application/WordService')

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

async function renderCorpusSearch() {
  const container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <CorpusTransliterationSearch
            paginationIndex={0}
            transliteration={'test'}
            textService={textService}
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>
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
