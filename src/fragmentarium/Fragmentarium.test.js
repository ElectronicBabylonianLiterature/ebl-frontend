import React from 'react'
import {MemoryRouter, withRouter} from 'react-router-dom'
import {render, cleanup, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import Fragmentarium from './Fragmentarium'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

let auth
let apiClient
let container
let element
let statistics

async function renderFragmentarium (path = '/fragmentarium') {
  const FragmentariumWithRouter = withRouter(Fragmentarium)
  element = render(<MemoryRouter initialEntries={[path]}><FragmentariumWithRouter auth={auth} apiClient={apiClient} /></MemoryRouter>)
  container = element.container
  await wait()
}

afterEach(cleanup)

beforeEach(async () => {
  statistics = await factory.build('statistics')
  auth = new Auth()
  apiClient = new ApiClient(auth)
})

describe('Searching for fragments', () => {
  let fragments

  beforeEach(async () => {
    fragments = await factory.buildMany('fragment', 2)
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockImplementation(path => path.startsWith('/fragments')
      ? Promise.resolve(fragments)
      : Promise.resolve(statistics)
    )
    await renderFragmentarium('/fragmentarium?number=K.1')
  })

  it('Displays result on successfull query', () => {
    expect(container).toHaveTextContent(fragments[0]._id)
  })
})

describe('Statistics', () => {
  beforeEach(async () => {
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(false)
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(statistics))
    await renderFragmentarium()
  })

  it('Shows the number of transliterated tablets', async () => {
    expect(container).toHaveTextContent(statistics.transliteratedFragments.toLocaleString())
  })

  it('Shows the number of transliterated lines', async () => {
    expect(container).toHaveTextContent(statistics.lines.toLocaleString())
  })
})
