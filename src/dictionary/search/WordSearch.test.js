import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import WordSearch from './WordSearch'
import { factory } from 'factory-girl'

const query = 'lem[ma?]'
let words
let wordRepository
let element

function renderWordSearch () {
  element = render(<MemoryRouter>
    <WordSearch query={query} wordRepository={wordRepository} />
  </MemoryRouter>)
}

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  wordRepository = {
    search: jest.fn()
  }
  wordRepository.search.mockReturnValueOnce(Promise.resolve(words))
  renderWordSearch()
})

it('Searches with the query', () => {
  expect(wordRepository.search).toBeCalledWith(query)
})

it('Displays results', async () => {
  await waitForElement(() => element.getByText(words[0].meaning))
  expect(element.getByText(words[1].meaning)).toBeDefined()
})
