import React from 'react'
import { matchPath } from 'react-router'
import { MemoryRouter } from 'react-router-dom'
import { render, cleanup, wait } from 'react-testing-library'
import { factory } from 'factory-girl'
import FragmentView from './FragmentView'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

const fragmentNumber = 'K.1'
const match = matchPath(`/fragmentarium/${fragmentNumber}`, {
  path: '/fragmentarium/:id'
})
const message = 'message'

let auth
let apiClient
let container
let element

async function renderFragmentView () {
  element = render(
    <MemoryRouter>
      <FragmentView match={match} auth={auth} apiClient={apiClient} />
    </MemoryRouter>
  )
  container = element.container
  await wait()
}

beforeEach(async () => {
  auth = new Auth()
  apiClient = new ApiClient(auth)
  URL.createObjectURL.mockReturnValue('url')
  jest.spyOn(apiClient, 'fetchBlob').mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
})

describe('Fragment is loaded', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment', { _id: fragmentNumber })
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    await renderFragmentView()
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    const expectedPath = `/fragments/${fragment._id}`
    expect(apiClient.fetchJson).toBeCalledWith(expectedPath, true, AbortController.prototype.signal)
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })

  it('Shows the fragment', async () => {
    expect(container).toHaveTextContent(fragment.transliteration)
  })

  it('Shows pager', () => {
    expect(element.getByLabelText('Next')).toBeVisible()
  })
})

describe('On error', () => {
  beforeEach(async () => {
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new Error(message)))
    await renderFragmentView()
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })
})

it('Displays a message if user is not logged in', async () => {
  jest.spyOn(auth, 'isAllowedTo').mockReturnValue(false)
  await renderFragmentView()

  expect(container).toHaveTextContent('You do not have the rights access the fragmentarium.')
})
