import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, wait } from 'react-testing-library'
import NumberSearch from './NumberSearch'
import { factory } from 'factory-girl'
import ApiClient from 'http/ApiClient'

const number = 'K.003292'
let fragments
let apiClient
let element

async function renderFragmentSearch () {
  element = render(
    <MemoryRouter>
      <NumberSearch number={number} apiClient={apiClient} />
    </MemoryRouter>
  )
  await wait()
}

beforeEach(async () => {
  apiClient = new ApiClient()
  jest.spyOn(apiClient, 'fetchJson')
  fragments = await factory.buildMany('fragment', 2)
  apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(fragments))
  await renderFragmentSearch()
})

it('Queries the API with given parameters', async () => {
  const expectedPath = `/fragments?number=${encodeURIComponent(number)}`
  expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
})

it('Displays and links results', async () => {
  for (let fragment of fragments) {
    expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
  }
})
