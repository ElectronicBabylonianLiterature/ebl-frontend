import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, wait, cleanup } from 'react-testing-library'
import FragmentSearch from './FragmentSearch'
import { factory } from 'factory-girl'
import { AbortError } from 'testHelpers'

const number = 'K.003292'
const message = 'error'
let fragments
let apiClient
let element

async function renderFragmentSearch () {
  element = render(
    <MemoryRouter>
      <FragmentSearch number={number} apiClient={apiClient} />
    </MemoryRouter>
  )
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  apiClient = {
    fetchJson: jest.fn()
  }
})

describe('Successful reqeust', () => {
  beforeEach(async () => {
    fragments = await factory.buildMany('fragment', 2)
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(fragments))
    await renderFragmentSearch()
  })

  it('Queries the API with given parameters', async () => {
    const expectedPath = `/fragments?number=${encodeURIComponent(number)}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
  })

  it('Displays results on successfull query', async () => {
    for (let fragment of fragments) {
      expect(element.container).toHaveTextContent(fragment._id)
      expect(element.container).toHaveTextContent(fragment.accession)
      expect(element.container).toHaveTextContent(fragment.cdliNumber)
      expect(element.container).toHaveTextContent(fragment.description)
    }
  })

  it('Results link to fragment', async () => {
    for (let fragment of fragments) {
      expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
    }
  })
})

it('Displays error on failed query', async () => {
  apiClient.fetchJson.mockReturnValueOnce(Promise.reject(new Error(message)))
  await renderFragmentSearch()

  expect(element.container).toHaveTextContent(message)
})

describe('When unmounting', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new AbortError(message)))
    await renderFragmentSearch()
  })

  it('Aborts fetch', () => {
    element.unmount()
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })

  it('Ignores AbortError', async () => {
    expect(element.container).not.toHaveTextContent(message)
  })
})
