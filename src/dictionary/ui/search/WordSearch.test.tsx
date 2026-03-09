import React from 'react'
import { screen, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Promise from 'bluebird'
import WordSearch from './WordSearch'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'

const query = { word: 'lem[ma?]' }
let words: Word[]
let wordService

async function renderWordSearch(): Promise<void> {
  render(
    <MemoryRouter>
      <WordSearch query={query} wordService={wordService} />
    </MemoryRouter>,
  )
  await waitForSpinnerToBeRemoved(screen)
}

const setup = async () => {
  words = wordFactory.buildList(2)
  wordService = {
    search: jest.fn(),
  }
  wordService.search.mockReturnValueOnce(Promise.resolve(words))
  await renderWordSearch()
}

it('Searches with the query', async () => {
  await setup()
  expect(wordService.search).toBeCalledWith(query)
})

it('Displays results', async () => {
  await setup()
  expect(screen.getByText(words[1].meaning)).toBeInTheDocument()
})
