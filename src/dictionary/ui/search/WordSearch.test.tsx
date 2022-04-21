import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'
import WordSearch from './WordSearch'
import { wordFactory } from 'test-support/word-fixtures'
import Word from 'dictionary/domain/Word'

const query = 'lem[ma?]'
let words: Word[]
let wordService

async function renderWordSearch(): Promise<void> {
  render(
    <MemoryRouter>
      <WordSearch query={query} wordService={wordService} />
    </MemoryRouter>
  )
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
}

beforeEach(async () => {
  words = wordFactory.buildList(2)
  wordService = {
    search: jest.fn(),
  }
  wordService.search.mockReturnValueOnce(Promise.resolve(words))
  await renderWordSearch()
})

it('Searches with the query', () => {
  expect(wordService.search).toBeCalledWith(query)
})

it('Displays results', async () => {
  expect(screen.getByText(words[1].meaning)).toBeInTheDocument()
})
