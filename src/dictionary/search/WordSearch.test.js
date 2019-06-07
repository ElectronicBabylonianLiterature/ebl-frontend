import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import WordSearch from './WordSearch'
import { factory } from 'factory-girl'

const query = 'lem[ma?]'
let words
let wordService
let element

function renderWordSearch() {
  element = render(
    <MemoryRouter>
      <WordSearch query={query} wordService={wordService} />
    </MemoryRouter>
  )
}

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  wordService = {
    search: jest.fn()
  }
  wordService.search.mockReturnValueOnce(Promise.resolve(words))
  renderWordSearch()
})

it('Searches with the query', () => {
  expect(wordService.search).toBeCalledWith(query)
})

it('Displays results', async () => {
  await waitForElement(() => element.getByText(words[0].meaning))
  expect(element.getByText(words[1].meaning)).toBeDefined()
})
