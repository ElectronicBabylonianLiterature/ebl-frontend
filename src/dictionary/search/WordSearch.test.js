import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {render, wait, cleanup} from 'react-testing-library'
import WordSearch from './WordSearch'
import {factory} from 'factory-girl'
import { AbortError } from 'testHelpers'

const query = 'lem[ma?]'
const errorMessage = 'error'
let words
let apiClient
let element

async function renderWordSearch () {
  element = render(<MemoryRouter><WordSearch query={query} apiClient={apiClient} /></MemoryRouter>)
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  apiClient = {
    fetchJson: jest.fn()
  }
})

it('Queries the Dictionary API with given parameters', async () => {
  apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  await renderWordSearch()

  const expectedPath = `/words?query=${encodeURIComponent(query)}`
  expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
})

it('displays result on successfull query', async () => {
  apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(words))
  await renderWordSearch()

  expect(element.getByText(words[0].meaning)).toBeDefined()
})

it('displays error on failed query', async () => {
  apiClient.fetchJson.mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
  await renderWordSearch()

  expect(element.container).toHaveTextContent(errorMessage)
})

describe('When unmounting', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new AbortError(errorMessage)))
    await renderWordSearch()
  })

  it('Aborts fetch', () => {
    element.unmount()
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })

  it('Ignores AbortError', async () => {
    expect(element.container).not.toHaveTextContent(errorMessage)
  })
})
