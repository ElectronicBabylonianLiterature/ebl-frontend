import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext } from 'router/head'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import SignService from 'signs/application/SignService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { wordFactory } from 'test-support/word-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('dictionary/application/WordService')
jest.mock('corpus/application/TextService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('signs/application/SignService')

const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

test('shows empty sections for a word without dictionary entries', async () => {
  const word = wordFactory.build({ origin: 'EBL' })
  wordService.find.mockResolvedValue(word)
  signService.search.mockResolvedValue([])
  fragmentService.query.mockResolvedValue({ items: [], matchCountTotal: 0 })
  textService.query.mockResolvedValue({ items: [], matchCountTotal: 0 })
  textService.searchLemma.mockResolvedValue([])

  render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter>
        <SessionContext.Provider value={new MemorySession(['read:words'])}>
          <DictionaryContext.Provider value={wordService}>
            <WordDisplay
              textService={textService}
              wordService={wordService}
              fragmentService={fragmentService}
              signService={signService}
              wordId={word._id}
            />
          </DictionaryContext.Provider>
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
  await screen.findAllByText('No entries')
  await waitForSpinnerToBeRemoved(screen)

  expect(screen.getAllByText('No entries').length).toBeGreaterThanOrEqual(3)
  expect(
    screen.queryByText(/By permission from Harrassowitz/),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByText(/By permission from the authors/),
  ).not.toBeInTheDocument()
  expect(screen.queryByText(/CC BY-ND 3.0/)).not.toBeInTheDocument()
})
