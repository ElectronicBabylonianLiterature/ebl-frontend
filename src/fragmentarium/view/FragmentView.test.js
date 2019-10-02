import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import FragmentView from './FragmentView'
import Lemmatization from 'fragmentarium/lemmatization/Lemmatization'

const message = 'message'
const fragmentNumber = 'K,K.1'

let fragmentService
let fragmentSearchService
let session
let container
let element

function renderFragmentView(
  initialEntry = `/${encodeURIComponent(fragmentNumber)}`
) {
  element = render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SessionContext.Provider value={session}>
        <Route
          path="/:id"
          render={({ match, location }) => (
            <FragmentView
              match={match}
              location={location}
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
            />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  container = element.container
}

beforeEach(async () => {
  const folioPager = await factory.build('folioPager')
  fragmentService = {
    find: jest.fn(),
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    folioPager: jest.fn(),
    createLemmatization: text => Promise.resolve(new Lemmatization([], []))
  }
  fragmentSearchService = {}
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: () => false,
    isAllowedToLemmatizeFragments: () => false,
    hasBetaAccess: () => false
  }
  URL.createObjectURL.mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
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
      `/${encodeURIComponent(
        fragmentNumber
      )}?tab=folio&folioName=${encodeURIComponent(
        selectedFolio.name
      )}&folioNumber=${encodeURIComponent(selectedFolio.number)}`
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
    renderFragmentView()
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
  renderFragmentView()
  await waitForElement(() =>
    element.getByText('Please log in to browse the Fragmentarium.')
  )
})
