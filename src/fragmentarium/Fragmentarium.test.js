import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, wait } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
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

beforeEach(async () => {
  statistics = await factory.build('statistics')
  auth = new Auth()
  apiClient = new ApiClient(auth)
})

describe('Search', () => {
  let fragments

  beforeEach(async () => {
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
    jest.spyOn(apiClient, 'fetchJson').mockImplementation(path => path.startsWith('/fragments')
      ? Promise.resolve(fragments)
      : Promise.resolve(statistics)
    )
  })

  describe('Searching fragments by number', () => {
    let number = 'K.2'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragment', 2)
      await renderFragmentarium(`/fragmentarium?number=${number}`)
    })

    it('Displays result on successfull query', () => {
      expect(container).toHaveTextContent(fragments[0]._id)
    })

    it('Fills in search form query', async () => {
      expect(element.getByLabelText('Number').value).toEqual(number)
    })
  })

  describe('Searching fragments by transliteration', () => {
    let transliteration = 'pak'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragment', 2, [
        { matching_lines: [['line 1', 'line 2']] },
        { matching_lines: [['line 3'], ['line 4']] }
      ])
      await renderFragmentarium(`/fragmentarium?transliteration=${transliteration}`)
    })

    it('Displays result on successfull query', () => {
      expect(container).toHaveTextContent(fragments[0]._id)
    })

    it('Fills in search form query', async () => {
      expect(element.getByLabelText('Transliteration').value).toEqual(transliteration)
    })
  })
})

describe('Statistics', () => {
  beforeEach(async () => {
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(false)
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
