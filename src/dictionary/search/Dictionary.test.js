import React from 'react'
import {render, wait, cleanup} from 'react-testing-library'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Dictionary from './Dictionary'
import Auth from '../../auth0/Auth'
import HttpClient from '../../http/HttpClient'

const DictionaryWithRouter = withRouter(Dictionary)

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

let auth
let httpClient

afterEach(cleanup)

beforeEach(() => {
  fetch.resetMocks()
  auth = new Auth()
  httpClient = new HttpClient(auth)
})

describe('Searching for word', () => {
  beforeEach(() => {
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(true)
    jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(words))
  })

  it('displays result on successfull query', async () => {
    const {getByText} = await renderDictionary('/dictionary?query=lemma')

    expect(getByText('lemma')).toBeDefined()
  })

  it('fills in search form query', async () => {
    const {getByLabelText} = await renderDictionary('/dictionary?query=lemma')

    expect(getByLabelText('Query').value).toEqual('lemma')
  })

  it('displays empty search if no query', async () => {
    const {getByLabelText} = await renderDictionary('/dictionary')

    expect(getByLabelText('Query').value).toEqual('')
  })
})

it('Displays a message if user is not logged in', async () => {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(false)

  const {getByText} = await renderDictionary('/dictionary')

  expect(getByText('You need to be logged in to access the dictionary.')).toBeDefined()
})

async function renderDictionary (path) {
  const element = render(<MemoryRouter initialEntries={[path]}><DictionaryWithRouter auth={auth} httpClient={httpClient} /></MemoryRouter>)
  await wait()
  return element
}
