import React from 'react'
import {matchPath} from 'react-router'
import {MemoryRouter} from 'react-router-dom'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import FragmentView from './FragmentView'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

const fragmentNumber = 'K.1'
const match = matchPath(`/fragmentarium/${fragmentNumber}`, {
  path: '/fragmentarium/:id'
})

let auth
let apiClient
let container
let element

async function renderFragmentView () {
  element = render(<MemoryRouter><FragmentView match={match} auth={auth} apiClient={apiClient} /></MemoryRouter>)
  container = element.container
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  auth = new Auth()
  apiClient = new ApiClient(auth)
  URL.createObjectURL.mockReturnValue('url')
  jest.spyOn(apiClient, 'fetchBlob').mockReturnValue(Promise.resolve(new Blob([''], {type: 'image/jpeg'})))
})

describe('Fragment is loaded', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment', {_id: fragmentNumber})
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    await renderFragmentView()
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    const expectedPath = `/fragments/${fragment._id}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath)
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })

  it('Shows the fragment', async () => {
    expect(container).toHaveTextContent(fragment.transliteration)
  })

  it('Shows pager', () => {
    expect(element.getByLabelText('Next')).toBeVisible()
  })
})

describe('On error', () => {
  const error = new Error('message')

  beforeEach(async () => {
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(error))
    await renderFragmentView()
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })

  it('Shows error message', () => {
    expect(container).toHaveTextContent(error.message)
  })
})

it('Displays a message if user is not logged in', async () => {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(false)
  await renderFragmentView()

  expect(container).toHaveTextContent('You need to be logged in to access the fragmentarium.')
})
