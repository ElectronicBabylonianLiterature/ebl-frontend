import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import {render, wait, cleanup} from 'react-testing-library'
import WordEditor from './WordEditor'
import HttpClient from '../../http/HttpClient'
import Auth from '../../auth0/Auth'

const result = {
  lemma: ['lemma'],
  pos: '',
  attested: true,
  forms: [],
  homonym: 'I',
  amplifiedMeanings: [],
  derived: [],
  derivedFrom: null,
  source: ''
}

let httpClient

afterEach(cleanup)

beforeEach(() => {
  httpClient = new HttpClient(new Auth())
})

it('Queries the word from API', () => {
  jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
  renderWithRouter()

  const expectedUrl = 'http://example.com/words/id'
  expect(httpClient.fetchJson).toBeCalledWith(expectedUrl)
})

it('Displays result on successfull query', async () => {
  jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
  const {getByText} = renderWithRouter()

  await wait()
  expect(getByText(result.lemma[0])).toBeDefined()
})

it('Displays error message on failed query', async () => {
  const errorMessage = 'error'
  jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
  const {getByText} = renderWithRouter()

  await wait()
  expect(getByText(errorMessage)).toBeDefined()
})

function renderWithRouter () {
  const match = matchPath('/dictionary/id', {
    path: '/dictionary/:id'
  })

  return render(<MemoryRouter>
    <WordEditor match={match} httpClient={httpClient} />
  </MemoryRouter>)
}
