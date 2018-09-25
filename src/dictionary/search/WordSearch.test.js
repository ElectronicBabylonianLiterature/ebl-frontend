import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, wait } from 'react-testing-library'
import WordSearch from './WordSearch'
import { factory } from 'factory-girl'
import ApiClient from '../../http/ApiClient';

const query = 'lem[ma?]'
let words
let apiClient
let element

async function renderWordSearch () {
  element = render(<MemoryRouter><WordSearch query={query} apiClient={apiClient} /></MemoryRouter>)
  await wait()
}

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  apiClient = new ApiClient()
  jest.spyOn(apiClient, 'fetchJson')
})

it('Queries the API with given parameters', async () => {
  apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  await renderWordSearch()

  const expectedPath = `/words?query=${encodeURIComponent(query)}`
  expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
})

it('Sisplays results', async () => {
  apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  await renderWordSearch()

  expect(element.getByText(words[0].meaning)).toBeDefined()
})
