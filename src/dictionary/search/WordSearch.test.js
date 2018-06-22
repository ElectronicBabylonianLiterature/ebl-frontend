import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {render, wait, cleanup} from 'react-testing-library'
import WordSearch from './WordSearch'

const words = [
  {
    _id: '1',
    lemma: ['lemma'],
    forms: [],
    homonym: 'I',
    amplifiedMeanings: {},
    derived: []
  },
  {
    _id: '2',
    lemma: ['lemma'],
    forms: [],
    homonym: 'II',
    amplifiedMeanings: {},
    derived: []
  }
]

let httpClient

afterEach(cleanup)

beforeEach(() => {
  httpClient = {
    fetchJson: jest.fn()
  }
})

it('Queries the Dictionary API with given parameters', async () => {
  httpClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  render(<MemoryRouter><WordSearch lemma='lemma' httpClient={httpClient} /></MemoryRouter>)
  await wait()

  const expectedUrl = 'http://example.com/words/search/lemma'
  expect(httpClient.fetchJson).toBeCalledWith(expectedUrl)
})

it('displays result on successfull query', async () => {
  httpClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  const element = render(<MemoryRouter><WordSearch lemma='lemma' httpClient={httpClient} /></MemoryRouter>)
  await wait()

  expect(element.getByText('lemma')).toBeDefined()
})

it('displays error on failed query', async () => {
  const errorMessage = 'error'
  httpClient.fetchJson.mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
  const element = render(<MemoryRouter><WordSearch lemma='lemma' httpClient={httpClient} /></MemoryRouter>)
  await wait()

  expect(element.getByText(errorMessage)).toBeDefined()
})
