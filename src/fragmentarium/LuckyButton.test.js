import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render, cleanup } from 'react-testing-library'
import {factory} from 'factory-girl'
import { whenClicked, clickNth } from 'testHelpers'
import LuckyButton from './LuckyButton'

const buttonText = 'I\'m feeling lucky'

let history
let apiClient
let element

afterEach(cleanup)

beforeEach(() => {
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  apiClient = {
    fetchJson: jest.fn()
  }
  element = render(<Router history={history}><LuckyButton apiClient={apiClient} /></Router>)
})

describe('Successful request', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment')
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve([fragment]))
  })

  it('Redirects to fragment when clicked', async () => {
    await whenClicked(element, buttonText)
      .expect(history.push)
      .toHaveBeenCalledWith(`/fragmentarium/${fragment._id}`)
  })

  it('Fetches random fragment from the API', async () => {
    await whenClicked(element, buttonText)
      .expect(apiClient.fetchJson)
      .toHaveBeenCalledWith('/fragments?random=true', true)
  })
})

describe('Failed request', () => {
  const message = 'Error'

  beforeEach(() => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.reject(new Error(message)))
  })

  it('Shows error message', async () => {
    await clickNth(element, buttonText, 0)
    expect(element.container).toHaveTextContent(message)
  })

  it('Does not redirect', async () => {
    await clickNth(element, buttonText, 0)
    expect(history.push).not.toHaveBeenCalled()
  })
})
