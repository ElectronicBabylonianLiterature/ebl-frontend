import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render, cleanup } from 'react-testing-library'
import {factory} from 'factory-girl'
import { whenClicked, clickNth, AbortError } from 'testHelpers'
import ApiClient from 'http/ApiClient'
import LuckyButton from './LuckyButton'

const buttonText = 'I\'m feeling lucky'
const message = 'Error'

let history
let apiClient
let element

afterEach(cleanup)

beforeEach(() => {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  apiClient = new ApiClient({})
  jest.spyOn(apiClient, 'fetchJson')
  element = render(<Router history={history}><LuckyButton apiClient={apiClient} /></Router>)
})

describe('On successful request', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment')
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve([fragment]))
  })

  it('Fetches a random fragment from the API', async () => {
    await whenClicked(element, buttonText)
      .expect(apiClient.fetchJson)
      .toHaveBeenCalledWith('/fragments?random=true', true, AbortController.prototype.signal)
  })

  it('Redirects to the fragment when clicked', async () => {
    await whenClicked(element, buttonText)
      .expect(history.push)
      .toHaveBeenCalledWith(`/fragmentarium/${fragment._id}`)
  })
})

describe('On failed request', () => {
  beforeEach(async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.reject(new Error(message)))
    await clickNth(element, buttonText, 0)
  })

  it('Shows error message', async () => {
    expect(element.container).toHaveTextContent(message)
  })

  it('Does not redirect', async () => {
    expect(history.push).not.toHaveBeenCalled()
  })
})

describe('When unmounting', () => {
  it('Aborts fetch', () => {
    element.unmount()
    expect(AbortController.prototype.abort).toHaveBeenCalled()
  })

  it('Ignores AbortError', async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.reject(new AbortError(message)))
    await clickNth(element, buttonText, 0)
    expect(element.container).not.toHaveTextContent(message)
  })
})
