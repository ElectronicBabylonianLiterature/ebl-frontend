import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'

let fragmentService
let session
let container
let element
let statistics

async function renderFragmentariumSearch (path = '/fragmentarium/search') {
  const FragmentariumSearchWithRouter = withRouter(FragmentariumSearch)
  element = render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <FragmentariumSearchWithRouter fragmentService={fragmentService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  container = element.container
  await waitForElement(() => element.getByText('Current size of the corpus:'))
}

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentService = {
    statistics: jest.fn(),
    searchNumber: jest.fn(),
    searchTransliteration: jest.fn()
  }
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: () => false
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
})

describe('Search', () => {
  let fragments

  beforeEach(async () => {
    session.isAllowedToReadFragments.mockReturnValue(true)
  })

  describe('Searching fragments by number', () => {
    let number = 'K.2'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragment', 2)
      fragmentService.searchNumber.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      renderFragmentariumSearch(`/fragmentarium/search?number=${number}`)
    })

    it('Displays result on successfull query', async () => {
      await waitForElement(() => element.getByText(fragments[0].number))
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(element.getByLabelText('Number').value).toEqual(number)
    })
  })

  describe('Searching fragments by transliteration', () => {
    let transliteration = 'LI23 cí-s,a-pèl-t,a3'
    let replacedTransliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragment', 2, [
        { matchingLines: [['line 1', 'line 2']] },
        { matchingLines: [['line 3'], ['line 4']] }
      ])
      fragmentService.searchTransliteration.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      renderFragmentariumSearch(
        `/fragmentarium/search?transliteration=${transliteration}`
      )
    })

    it('Displays result on successfull query', async () => {
      await waitForElement(() => element.getByText(fragments[0].number))
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(element.getByLabelText('Transliteration').value).toEqual(
        replacedTransliteration
      )
    })
  })
})
