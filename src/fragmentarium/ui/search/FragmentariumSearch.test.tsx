import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentariumSearch from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'

const fragmentSearchService = new (FragmentSearchService as jest.Mock<
  FragmentSearchService
>)()
const session = new (MemorySession as jest.Mock<MemorySession>)()
let container: Element
let element: RenderResult

async function renderFragmentariumSearch({
  number,
  transliteration,
}: {
  number?: string | null | undefined
  transliteration?: string | null | undefined
}): Promise<void> {
  await act(async () => {
    element = render(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <FragmentariumSearch
            id={undefined}
            title={undefined}
            pages={undefined}
            primaryAuthor={undefined}
            year={undefined}
            number={number}
            transliteration={transliteration}
            fragmentSearchService={fragmentSearchService}
            fragmentService={
              new (FragmentService as jest.Mock<FragmentService>)()
            }
          />
        </SessionContext.Provider>
      </MemoryRouter>
    )
  })
  container = element.container
}

beforeEach(async () => {
  fragmentSearchService.searchNumber = jest.fn()
  fragmentSearchService.searchTransliteration = jest.fn()

  session.isAllowedToReadFragments = jest.fn()
  session.isAllowedToTransliterateFragments = jest.fn().mockReturnValue(false)
})

describe('Search', () => {
  let fragments

  beforeEach(async () => {
    session.isAllowedToReadFragments = jest.fn().mockReturnValue(true)
  })

  describe('Searching fragments by number', () => {
    const number = 'K.2'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragmentInfo', 2)
      fragmentSearchService.searchNumber = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(fragments))
      await renderFragmentariumSearch({ number })
    })

    it('Displays result on successfull query', async () => {
      await element.findByText(fragments[0].number)
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(
        (element.getByLabelText('Number') as HTMLInputElement).value
      ).toEqual(number)
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
      fragmentSearchService.searchTransliteration = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(fragments))
      await renderFragmentariumSearch({ transliteration })
    })

    it('Displays result on successfull query', async () => {
      await element.findByText(fragments[0].number)
      expect(container).toHaveTextContent(fragments[1].number)
    })

    it('Fills in search form query', () => {
      expect(
        (element.getByLabelText('Transliteration') as HTMLInputElement).value
      ).toEqual(replacedTransliteration)
    })
  })
})
