import React from 'react'
import { render, wait } from 'react-testing-library'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import Dictionary from './Dictionary'
import Auth from 'auth0/Auth'
import ApiClient from 'http/ApiClient'
import { factory } from 'factory-girl'

const DictionaryWithRouter = withRouter(Dictionary)

let words
let auth
let apiClient

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  fetch.resetMocks()
  auth = new Auth()
  apiClient = new ApiClient(auth)
})

describe('Searching for word', () => {
  beforeEach(() => {
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(words))
  })

  it('displays result on successfull query', async () => {
    const { getByText } = await renderDictionary('/dictionary?query=lemma')

    expect(getByText(words[0].meaning)).toBeDefined()
  })

  it('fills in search form query', async () => {
    const { getByLabelText } = await renderDictionary('/dictionary?query=lemma')

    expect(getByLabelText('Query').value).toEqual('lemma')
  })

  it('displays empty search if no query', async () => {
    const { getByLabelText } = await renderDictionary('/dictionary')

    expect(getByLabelText('Query').value).toEqual('')
  })
})

it('Displays a message if user is not logged in', async () => {
  jest.spyOn(auth, 'isAllowedTo').mockReturnValueOnce(false)

  const { getByText } = await renderDictionary('/dictionary')

  expect(getByText('You do not have the rights to access the dictionary.')).toBeDefined()
})

async function renderDictionary (path) {
  const element = render(<MemoryRouter initialEntries={[path]}><DictionaryWithRouter auth={auth} apiClient={apiClient} /></MemoryRouter>)
  await wait()
  return element
}
