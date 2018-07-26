import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import { render, wait, cleanup } from 'react-testing-library'
import { submitForm, AbortError } from 'testHelpers'
import WordEditor from './WordEditor'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import { factory } from 'factory-girl'

const errorMessage = 'error'
let result
let apiClient

afterEach(cleanup)

beforeEach(async () => {
  result = await factory.build('verb')
  apiClient = new ApiClient(new Auth())
})

describe('Fecth word', () => {
  it('Queries the word from API', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    await renderWithRouter()

    const expectedPath = '/words/id'
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
  })

  it('Displays result on successfull query', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    const {getByText} = await renderWithRouter()

    expect(getByText(result.lemma.join(' '))).toBeDefined()
  })

  it('Displays error message on failed query', async () => {
    const errorMessage = 'error'
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
    const {getByText} = await renderWithRouter()

    expect(getByText(errorMessage)).toBeDefined()
  })
})

describe('Update word', () => {
  beforeEach(() => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
  })

  it('Posts to API on submit', async () => {
    jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve())
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    const expectedPath = '/words/id'
    const expectedBody = result
    expect(apiClient.postJson).toHaveBeenCalledWith(expectedPath, expectedBody, AbortController.prototype.signal)
  })

  it('Displays error message on failed post', async () => {
    jest.spyOn(apiClient, 'postJson').mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    expect(element.getByText(errorMessage)).toBeDefined()
  })

  it('Ignores AbortError', async () => {
    jest.spyOn(apiClient, 'postJson').mockImplementationOnce(() => Promise.reject(new AbortError(errorMessage)))
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    expect(element.container).not.toHaveTextContent(errorMessage)
  })
})

describe('When unmounting', () => {
  let element

  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new AbortError(errorMessage)))
    element = await renderWithRouter()
  })

  it('Aborts fetch', () => {
    element.unmount()
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })

  it('Ignores AbortError', async () => {
    expect(element.container).not.toHaveTextContent(errorMessage)
  })
})

async function renderWithRouter () {
  const match = matchPath('/dictionary/id', {
    path: '/dictionary/:id'
  })

  const element = render(
    <MemoryRouter>
      <WordEditor match={match} apiClient={apiClient} />
    </MemoryRouter>
  )
  await wait()
  return element
}
