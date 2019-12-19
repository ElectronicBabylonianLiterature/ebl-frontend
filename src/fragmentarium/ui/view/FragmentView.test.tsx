import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import FragmentView from './FragmentView'
import Lemmatization from 'fragmentarium/domain/Lemmatization'

const message = 'message'
const fragmentNumber = 'K,K.1'

let fragmentService
let fragmentSearchService
let session
let container
let element

function renderFragmentView(
  number: string,
  folioName: string | null,
  folioNumber: string | null,
  tab: string | null
): void {
  element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <FragmentView
          number={number}
          folioName={folioName}
          folioNumber={folioNumber}
          tab={tab}
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  container = element.container
}

beforeEach(async () => {
  const folioPager = await factory.build('folioPager')
  const fragmentPagerData = {
    next: { fragmentNumber: 'K.00001' },
    previous: { fragmentNumber: 'J.99999' }
  }
  fragmentService = {
    find: jest.fn(),
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    folioPager: jest.fn(),
    fragmentPager: jest.fn(),
    createLemmatization: text => Promise.resolve(new Lemmatization([], [])),
    fetchCdliInfo: () => Promise.resolve({ photoUrl: null })
  }
  fragmentSearchService = {}
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: () => false,
    isAllowedToLemmatizeFragments: () => false,
    hasBetaAccess: () => false
  }
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))

  fragmentService.fragmentPager.mockReturnValue(
    Promise.resolve(fragmentPagerData)
  )
})

describe('Fragment is loaded', () => {
  let fragment
  let selectedFolio

  beforeEach(async () => {
    const folios = await factory.buildMany('folio', 2, {}, [
      { name: 'WGL' },
      { name: 'AKG' }
    ])
    fragment = (await factory.build('fragment', {
      number: fragmentNumber,
      folios: folios,
      atf: '1. ku'
    })).setReferences(await factory.buildMany('reference', 2))
    selectedFolio = fragment.folios[0]
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment))
    session.isAllowedToReadFragments.mockReturnValue(true)
    renderFragmentView(
      fragmentNumber,
      selectedFolio.name,
      selectedFolio.number,
      'folio'
    )
    await waitForElement(() => element.getByText('Display'))
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    expect(fragmentService.find).toBeCalledWith(fragmentNumber)
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })

  xit('Shows the fragment', async () => {
    expect(container).toHaveTextContent(fragment.atf)
  })

  it('Shows pager', () => {
    expect(element.getByLabelText('Next')).toBeVisible()
  })

  it('Selects active folio', () => {
    expect(
      element.getByText(
        `${selectedFolio.humanizedName} Folio ${selectedFolio.number}`
      )
    ).toHaveAttribute('aria-selected', 'true')
  })
})

describe('On error', () => {
  beforeEach(() => {
    session.isAllowedToReadFragments.mockReturnValue(true)
    fragmentService.find.mockReturnValueOnce(Promise.reject(new Error(message)))
    renderFragmentView(fragmentNumber, null, null, null)
  })

  it('Shows the error message', async () => {
    await waitForElement(() => element.getByText(message))
  })

  it('Shows the fragment number', async () => {
    expect(element.container).toHaveTextContent(fragmentNumber)
  })
})

it('Displays a message if user is not logged in', async () => {
  session.isAllowedToReadFragments.mockReturnValue(false)
  renderFragmentView(fragmentNumber, null, null, null)
  await waitForElement(() =>
    element.getByText('Please log in to browse the Fragmentarium.')
  )
})
