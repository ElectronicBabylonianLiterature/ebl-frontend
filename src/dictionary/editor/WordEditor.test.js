import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import { render, wait } from 'react-testing-library'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { submitForm } from 'testHelpers'
import WordEditor from './WordEditor'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import { factory } from 'factory-girl'

const errorMessage = 'error'
let result
let auth
let apiClient

beforeEach(async () => {
  result = await factory.build('verb')
  auth = new Auth()
  apiClient = new ApiClient()
})

describe('Fecth word', () => {
  it('Queries the word from API', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    await renderWithRouter()

    const expectedPath = '/words/id'
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true)
  })

  it('Displays result on successfull query', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    const { getByText } = await renderWithRouter()

    expect(getByText(result.lemma.join(' '))).toBeDefined()
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
    expect(apiClient.postJson).toHaveBeenCalledWith(expectedPath, expectedBody)
  })

  it('Displays error message on failed post', async () => {
    jest.spyOn(apiClient, 'postJson').mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    expect(element.getByText(errorMessage)).toBeDefined()
  })

  it('Cancels post on unmount', async () => {
    const promise = new Promise(_.noop)
    jest.spyOn(promise, 'cancel')
    jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(promise)
    const element = await renderWithRouter()
    submitForm(element, 'form')
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})

describe('User is not allowed to write:words', () => {
  it('The form is disabled', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    const { container } = await renderWithRouter(false)
    expect(container.querySelector('fieldset').disabled).toBe(true)
  })
})

async function renderWithRouter (isAllowedTo = true) {
  const match = matchPath('/dictionary/id', {
    path: '/dictionary/:id'
  })
  jest.spyOn(auth, 'isAllowedTo').mockReturnValueOnce(isAllowedTo)

  const element = render(
    <MemoryRouter>
      <WordEditor match={match} auth={auth} apiClient={apiClient} />
    </MemoryRouter>
  )
  await wait()
  return element
}
