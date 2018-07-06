import React from 'react'
import {matchPath} from 'react-router'
import {MemoryRouter} from 'react-router-dom'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import Fragmentarium from './Fragmentarium'
import ApiClient from '../http/ApiClient'
import Auth from '../auth0/Auth'

const fragmentId = 'K.1'
const match = matchPath(`/fragmentarium/${fragmentId}`, {
  path: '/fragmentarium/:id'
})

let apiClient
let container

afterEach(cleanup)

describe('Fragment is loaded', () => {
  let fragment
  let element

  beforeEach(async () => {
    fragment = await factory.build('fragment', {_id: fragmentId})
    apiClient = new ApiClient(new Auth())
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    element = render(<MemoryRouter><Fragmentarium match={match} apiClient={apiClient} /></MemoryRouter>)
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
    apiClient = new ApiClient(new Auth())
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(error))

    container = render(<MemoryRouter><Fragmentarium match={match} apiClient={apiClient} /></MemoryRouter>).container
    await wait()
  })

  it('Shows error message', () => {
    expect(container).toHaveTextContent(error.message)
  })
})
