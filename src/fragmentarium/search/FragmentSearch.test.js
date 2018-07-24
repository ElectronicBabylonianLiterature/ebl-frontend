import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {render, wait, cleanup} from 'react-testing-library'
import FragmentSearch from './FragmentSearch'
import {factory} from 'factory-girl'

let fragments
let apiClient
let element

afterEach(cleanup)

beforeEach(async () => {
  apiClient = {
    fetchJson: jest.fn()
  }
})

describe('Successful reqeust', () => {
  const number = 'K.003292'

  beforeEach(async () => {
    fragments = await factory.buildMany('fragment', 2)
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(fragments))
    element = render(<MemoryRouter><FragmentSearch number={number} apiClient={apiClient} /></MemoryRouter>)
    await wait()
  })

  it('Queries the API with given parameters', async () => {
    const expectedPath = `/fragments?number=${encodeURIComponent(number)}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true)
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
  const errorMessage = 'error'
  apiClient.fetchJson.mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
  const {container} = render(<MemoryRouter><FragmentSearch number='K.1' apiClient={apiClient} /></MemoryRouter>)
  await wait()

  expect(container).toHaveTextContent(errorMessage)
})
