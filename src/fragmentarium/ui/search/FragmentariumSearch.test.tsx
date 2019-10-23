import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import { transliteration } from 'test-helpers/record-fixtures'

let fragmentService
let fragmentSearchService
let session
let container
let element
let statistics

async function renderFragmentariumSearch({ number, transliteration }: {number?: string | null | undefined; transliteration?: string | null | undefined}) {
  const FragmentariumSearchWithRouter = withRouter<any, any>(FragmentariumSearch)
  element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <FragmentariumSearchWithRouter
          number={number}
          transliteration={transliteration}
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  container = element.container
  await waitForElement(() => element.getByText('Current size of the corpus:'))
}

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentService = {
    statistics: jest.fn()
  }
  fragmentSearchService = {
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
    const number = 'K.2'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragmentInfo', 2)
      fragmentSearchService.searchNumber.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      renderFragmentariumSearch({ number })
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
    const transliteration = 'LI23 cí-s,a-pèl-t,a3'
    const replacedTransliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragmentInfo', 2, [
        { matchingLines: [['line 1', 'line 2']] },
        { matchingLines: [['line 3'], ['line 4']] }
      ])
      fragmentSearchService.searchTransliteration.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      renderFragmentariumSearch({ transliteration })
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
