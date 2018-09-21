import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, wait, cleanup } from 'react-testing-library'
import TransliterationSearch from './TransliterationSearch'
import { factory } from 'factory-girl'
import _ from 'lodash'

const transliteration = 'ma i-ra\nka li'
let fragments
let apiClient
let element

async function renderFragmentSearch () {
  element = render(
    <MemoryRouter>
      <TransliterationSearch transliteration={transliteration} apiClient={apiClient} />
    </MemoryRouter>
  )
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  apiClient = {
    fetchJson: jest.fn()
  }
  fragments = await factory.buildMany('fragment', 2, [
    { matching_lines: [['line 1', 'line 2']] },
    { matching_lines: [['line 3'], ['line 4']] }
  ])
  apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(fragments))
  await renderFragmentSearch()
})

it('Queries the API with given parameters', async () => {
  const expectedPath = `/fragments?transliteration=${encodeURIComponent(transliteration)}`
  expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
})

it('Links results', async () => {
  for (let fragment of fragments) {
    expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
  }
})

it('Displays script', async () => {
  for (let fragment of fragments) {
    expect(element.queryByText(fragment.script)).not.toBeNull()
  }
})

it('Displays matching lines', async () => {
  for (let line of _.flatMapDeep(fragments, 'matching_lines')) {
    expect(element.getByText(line)).not.toBeNull()
  }
})
