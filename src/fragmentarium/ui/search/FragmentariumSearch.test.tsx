import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { act, render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession from 'auth/Session'
jest.mock('fragmentarium/application/FragmentSearchService')

let fragmentSearchService
let session
let container
let element

async function renderFragmentariumSearch({
  number,
  transliteration,
}: {
  number?: string | null | undefined
  transliteration?: string | null | undefined
}): Promise<void> {
  const FragmentariumSearchWithRouter = withRouter<any, any>(
    FragmentariumSearch
  )
  await act(async () => {
    element = render(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <FragmentariumSearchWithRouter
            number={number}
            transliteration={transliteration}
            fragmentSearchService={fragmentSearchService}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    )
  })
  container = element.container
}

beforeEach(async () => {
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  session = new MemorySession(['read:fragments'])
})

describe('Search', () => {
  let fragments

  describe('Searching fragments by number', () => {
    const number = 'K.2'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragmentInfo', 2)
      fragmentSearchService.searchNumber.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      await renderFragmentariumSearch({ number })
    })

    it('Displays result on successfull query', async () => {
      await element.findByText(fragments[0].number)
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
        { matchingLines: [['line 3'], ['line 4']] },
      ])
      fragmentSearchService.searchTransliteration.mockReturnValueOnce(
        Promise.resolve(fragments)
      )
      await renderFragmentariumSearch({ transliteration })
    })

    it('Displays result on successfull query', async () => {
      await element.findByText(fragments[0].number)
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(element.getByLabelText('Transliteration').value).toEqual(
        replacedTransliteration
      )
    })
  })
})
