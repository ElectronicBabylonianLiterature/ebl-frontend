import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render, cleanup } from 'react-testing-library'
import {factory} from 'factory-girl'
import { whenClicked } from 'testHelpers'
import LuckyButton from './LuckyButton'

let fragment
let history
let apiClient
let element

afterEach(cleanup)

beforeEach(async () => {
  fragment = await factory.build('fragment')
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
  apiClient = {
    fetchJson: jest.fn()
  }
  apiClient.fetchJson.mockReturnValueOnce(Promise.resolve([fragment]))
  element = render(<Router history={history}><LuckyButton apiClient={apiClient} /></Router>)
})

it('Redirects to fragment when clicked', async () => {
  await whenClicked(element, 'I\'am feeling lucky')
    .expect(history.push)
    .toHaveBeenCalledWith(`/fragmentarium/${fragment._id}`)
})

it('Fetches random fragment from the API', async () => {
  await whenClicked(element, 'I\'am feeling lucky')
    .expect(apiClient.fetchJson)
    .toHaveBeenCalledWith('/fragments?random=true', true)
})
