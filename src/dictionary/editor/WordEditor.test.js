import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import {render, wait, cleanup, fireEvent} from 'react-testing-library'
import WordEditor from './WordEditor'
import ApiClient from '../../http/ApiClient'
import Auth from '../../auth0/Auth'
import {factory} from 'factory-girl'

let result
let apiClient

afterEach(cleanup)

beforeEach(async () => {
  result = await factory.build('verb')
  apiClient = new ApiClient(new Auth())
})

describe('Fecth word', () => {
  it('Queries the word from API', () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    renderWithRouter()

    const expectedPath = '/words/id'
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath)
  })

  it('Displays result on successfull query', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    const {getByText} = renderWithRouter()

    await wait()
    expect(getByText(result.lemma.join(' '))).toBeDefined()
  })

  it('Displays error message on failed query', async () => {
    const errorMessage = 'error'
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new Error(errorMessage)))
    const {getByText} = renderWithRouter()

    await wait()
    expect(getByText(errorMessage)).toBeDefined()
  })
})

describe('Update word', () => {
  it('Posts to API on submit', async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve())
    const {container} = renderWithRouter()

    await wait()
    await post(container)

    const expectedPath = '/words/id'
    const expectedBody = result
    expect(apiClient.postJson).toHaveBeenCalledWith(expectedPath, expectedBody)
  })

  it('Displays error message on failed post', async () => {
    const errorMessage = 'error'
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
    jest.spyOn(apiClient, 'postJson').mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    const {container, getByText} = renderWithRouter()

    await wait()
    await post(container)

    expect(getByText(errorMessage)).toBeDefined()
  })
})

async function post (container) {
  fireEvent.submit(container.querySelector('form'))
  await wait()
}

function renderWithRouter () {
  const match = matchPath('/dictionary/id', {
    path: '/dictionary/:id'
  })

  return render(<MemoryRouter>
    <WordEditor match={match} apiClient={apiClient} />
  </MemoryRouter>)
}
