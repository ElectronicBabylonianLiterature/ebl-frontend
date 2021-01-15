import React, { FunctionComponent } from 'react'
import { MemoryRouter, RouteComponentProps, withRouter } from 'react-router-dom'
import { act, render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentariumSearch, { Props } from './FragmentariumSearch'
import SessionContext from 'auth/SessionContext'
import FragmentService from 'fragmentarium/application/FragmentService'

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
  const FragmentariumSearchWithRouter = withRouter<
    Props & RouteComponentProps,
    FunctionComponent<Props>
  >(FragmentariumSearch)
  await act(async () => {
    element = render(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <FragmentariumSearchWithRouter
            number={number}
            id={undefined}
            title={undefined}
            primaryAuthor={undefined}
            year={undefined}
            pages={undefined}
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
  fragmentSearchService = {
    searchNumber: jest.fn(),
    searchTransliteration: jest.fn(),
  }
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: (): boolean => false,
  }
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
