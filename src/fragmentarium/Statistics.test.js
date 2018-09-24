import React from 'react'
import { render, wait } from 'react-testing-library'
import { factory } from 'factory-girl'
import Statistics from './Statistics'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

let apiClient
let element
let container
let statistics

async function renderStatistics () {
  element = render(<Statistics apiClient={apiClient} />)
  container = element.container
  await wait()
}

beforeEach(async () => {
  const auth = new Auth()
  apiClient = new ApiClient(auth)
  statistics = await factory.build('statistics')
  jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(statistics))
  await renderStatistics()
})

it('Queries the statistics', async () => {
  expect(apiClient.fetchJson).toBeCalledWith('/statistics', false, AbortController.prototype.signal)
})

it('Shows the number of transliterated tablets', async () => {
  expect(container).toHaveTextContent(statistics.transliteratedFragments.toLocaleString())
})

it('Shows the number of transliterated lines', async () => {
  expect(container).toHaveTextContent(statistics.lines.toLocaleString())
})
