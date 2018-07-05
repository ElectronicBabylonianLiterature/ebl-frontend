import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {render, wait, cleanup} from 'react-testing-library'
import WordSearch from './WordSearch'
import {factory} from 'factory-girl'

let words
let httpClient

afterEach(cleanup)

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  httpClient = {
    fetchJson: jest.fn()
  }
})

it('Queries the Dictionary API with given parameters', async () => {
  const query = 'lem[ma?]'
  httpClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  render(<MemoryRouter><WordSearch query={query} httpClient={httpClient} /></MemoryRouter>)
  await wait()

  const expectedPath = `/words?query=${encodeURIComponent(query)}`
  expect(httpClient.fetchJson).toBeCalledWith(expectedPath)
})

it('displays result on successfull query', async () => {
  httpClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  const element = render(<MemoryRouter><WordSearch query='lemma' httpClient={httpClient} /></MemoryRouter>)
  await wait()

  expect(element.getByText(words[0].meaning)).toBeDefined()
})

it('displays error on failed query', async () => {
  const errorMessage = 'error'
  httpClient.fetchJson.mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
  const element = render(<MemoryRouter><WordSearch query='lemma' httpClient={httpClient} /></MemoryRouter>)
  await wait()

  expect(element.getByText(errorMessage)).toBeDefined()
})
