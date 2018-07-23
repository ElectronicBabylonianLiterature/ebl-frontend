import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import Fragmentarium from './Fragmentarium'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

let auth
let apiClient
let container
let element

async function renderFragmentarium () {
  element = render(<MemoryRouter><Fragmentarium apiClient={apiClient} /></MemoryRouter>)
  container = element.container
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  auth = new Auth()
  apiClient = new ApiClient(auth)
})

describe('Statistics are loaded', () => {
  let statistics

  beforeEach(async () => {
    statistics = await factory.build('statistics')
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(statistics))
    await renderFragmentarium()
  })

  it('Queries the statistics', async () => {
    expect(apiClient.fetchJson).toBeCalledWith('/statistics', false)
  })

  it('Shows the number of transliterated tablets', async () => {
    expect(container).toHaveTextContent(statistics.transliteratedFragments)
  })

  it('Shows the number of transliterated lines', async () => {
    expect(container).toHaveTextContent(statistics.lines)
  })
})

describe('On error', () => {
  const message = 'message'

  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new Error(message)))
    await renderFragmentarium()
  })

  it('Shows error message', () => {
    expect(container).toHaveTextContent(message)
  })
})
