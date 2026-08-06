import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import SignService from 'signs/application/SignService'
import MemorySession from 'auth/Session'
import { DictionaryContext } from '../dictionary-context'
import { Chance } from 'chance'
import { dictionaryLineDisplayFactory } from 'test-support/dictionary-line-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { fragment, lines } from 'test-support/test-fragment'
import { QueryResult } from 'query/QueryResult'
import { produce, castDraft } from 'immer'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext } from 'router/head'
import { word } from 'dictionary/ui/display/WordDisplay.testSupport'

jest.mock('dictionary/application/WordService')
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

jest.mock('corpus/application/TextService')
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

jest.mock('fragmentarium/application/FragmentService')
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

jest.mock('signs/application/SignService')
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

const session = new MemorySession(['read:words'])

const chance = new Chance('word-display-test')

const matchingLines = [0, 1]

const partialText = new Text({
  lines: lines.slice(2).map((lineDto) => new TextLine(lineDto)),
})

const partialLinesFragment = produce(fragment, (draft) => {
  draft.text = castDraft(partialText)
})

describe('Fetch word', () => {
  const setup = async () => {
    const queryResult: QueryResult = {
      items: [
        {
          museumNumber: 'Test.Fragment',
          matchingLines: matchingLines,
          matchCount: matchingLines.length,
        },
      ],
      matchCountTotal: matchingLines.length,
    }
    wordService.find.mockReturnValue(Promise.resolve(word))
    signService.search.mockReturnValue(Promise.resolve([]))
    fragmentService.find.mockReturnValue(Promise.resolve(partialLinesFragment))
    fragmentService.query.mockReturnValue(Promise.resolve(queryResult))
    textService.searchLemma.mockReturnValue(
      Promise.resolve(
        dictionaryLineDisplayFactory.buildList(
          10,
          {},
          { transient: { chance: chance } },
        ),
      ),
    )
    textService.query.mockReturnValue(
      Promise.resolve({ items: [], matchCountTotal: 42 }),
    )

    const view = renderWordInformationDisplay()
    await screen.findByText(word.meaning)

    await waitFor(() =>
      expect(wordService.find).toBeCalledWith('id', expect.any(AbortSignal)),
    )
    await waitFor(() =>
      expect(fragmentService.find).toBeCalledWith(
        fragment.number,
        matchingLines,
      ),
    )

    await waitFor(() =>
      expect(textService.query).toBeCalledWith({ lemmas: word._id }),
    )
    await waitFor(() =>
      expect(textService.searchLemma).toBeCalledWith(
        word._id,
        undefined,
        expect.any(AbortSignal),
      ),
    )

    return view
  }
  it('correctly displays word parts', async () => {
    const view = await setup()
    expect(view.container).toMatchSnapshot()
    await screen.findAllByText(new RegExp(word.guideWord))
    expect(screen.getByText(word.meaning)).toBeInTheDocument()
    expect(screen.getAllByText(word.guideWord).length).toBeGreaterThan(0)
    expect(
      screen.getByText(new RegExp(word.lemma.join(' '))),
    ).toBeInTheDocument()
  })
  it('displays the matching lines', async () => {
    await setup()
    expect(screen.getAllByText('10')).toHaveLength(2)
  })
})

function renderWordInformationDisplay() {
  return render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={['/dictionary/id']}>
        <SessionContext.Provider value={session}>
          <Route
            path="/dictionary/:id"
            render={({ match }) => (
              <DictionaryContext.Provider value={wordService}>
                <WordDisplay
                  textService={textService}
                  wordService={wordService}
                  fragmentService={fragmentService}
                  signService={signService}
                  wordId={match.params.id ?? ''}
                />
              </DictionaryContext.Provider>
            )}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}
