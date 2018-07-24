import React from 'react'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import Statistics from './Statistics'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

let apiClient
let container

async function renderStatistics () {
  container = render(<Statistics apiClient={apiClient} />).container
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  let auth = new Auth()
  apiClient = new ApiClient(auth)
})

describe('On load', () => {
  let statistics

  beforeEach(async () => {
    statistics = await factory.build('statistics')
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(statistics))
    await renderStatistics()
  })

  it('Queries the statistics', async () => {
    expect(apiClient.fetchJson).toBeCalledWith('/statistics', false)
  })

  it('Shows the number of transliterated tablets', async () => {
    expect(container).toHaveTextContent(statistics.transliteratedFragments.toLocaleString())
  })

  it('Shows the number of transliterated lines', async () => {
    expect(container).toHaveTextContent(statistics.lines.toLocaleString())
  })
})

describe('On error', () => {
  const message = 'message'

  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new Error(message)))
    await renderStatistics()
  })

  it('Shows error message', () => {
    expect(container).toHaveTextContent(message)
  })
})
