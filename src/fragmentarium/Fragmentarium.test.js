import React from 'react'
import { matchPath } from 'react-router'
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

  beforeEach(async () => {
    fragment = await factory.build('fragment', {_id: fragmentId})
    apiClient = new ApiClient(new Auth())
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    container = render(<Fragmentarium match={match} apiClient={apiClient} />).container
    await wait()
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    const expectedPath = `/fragments/${fragment._id}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath)
  })

  it('Shows the fragment', async () => {
    expect(container).toHaveTextContent(fragment.transliteration)
  })
})

describe('On error', () => {
  const error = new Error('message')

  beforeEach(async () => {
    apiClient = new ApiClient(new Auth())
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(error))

    container = render(<Fragmentarium match={match} apiClient={apiClient} />).container
    await wait()
  })

  it('Shows error message', () => {
    expect(container).toHaveTextContent(error.message)
  })
})
