import React from 'react'
import {matchPath} from 'react-router'
import {MemoryRouter} from 'react-router-dom'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import Fragmentarium from './Fragmentarium'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

const fragmentId = 'K.1'
const match = matchPath(`/fragmentarium/${fragmentId}`, {
  path: '/fragmentarium/:id'
})

let auth
let apiClient
let container

afterEach(cleanup)

beforeEach(async () => {
  auth = new Auth()
  apiClient = new ApiClient(auth)
})

describe('Fragment is loaded', () => {
  let fragment
  let element

  beforeEach(async () => {
    fragment = await factory.build('fragment', {_id: fragmentId})
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    element = render(<MemoryRouter><Fragmentarium match={match} auth={auth} apiClient={apiClient} /></MemoryRouter>)
    container = element.container
    await wait()
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    const expectedPath = `/fragments/${fragment._id}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath)
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

    container = render(<MemoryRouter><Fragmentarium match={match} auth={auth} apiClient={apiClient} /></MemoryRouter>).container
    await wait()
  })

  it('Shows error message', () => {
    expect(container).toHaveTextContent(error.message)
  })
})

it('Displays a message if user is not logged in', async () => {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(false)

  container = render(<MemoryRouter><Fragmentarium match={match} auth={auth} apiClient={apiClient} /></MemoryRouter>).container

  expect(container).toHaveTextContent('You need to be logged in to access the fragmentarium.')
})
