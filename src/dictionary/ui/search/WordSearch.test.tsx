import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import WordSearch from './WordSearch'
import { factory } from 'factory-girl'

const query = 'lem[ma?]'
let words
let wordService

function renderWordSearch(): void {
  render(
    <MemoryRouter>
      <WordSearch query={query} wordService={wordService} />
    </MemoryRouter>
  )
}

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  wordService = {
    search: jest.fn(),
  }
  wordService.search.mockReturnValueOnce(Promise.resolve(words))
  renderWordSearch()
  await screen.findByText(words[0].meaning)
})

it('Searches with the query', () => {
  expect(wordService.search).toBeCalledWith(query)
})

it('Displays results', async () => {
  expect(screen.getByText(words[1].meaning)).toBeDefined()
})
