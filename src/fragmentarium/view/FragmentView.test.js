import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { render, wait, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentView from './FragmentView'

const message = 'message'
const fragmentNumber = 'K,K.1'

let fragmentService
let container
let element

function renderFragmentView (initialEntry = `/${encodeURIComponent(fragmentNumber)}`) {
  element = render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Route path='/:id' render={({ match, location }) =>
        <FragmentView match={match} location={location} fragmentService={fragmentService} />
      } />
    </MemoryRouter>
  )
  container = element.container
}

beforeEach(async () => {
  const folioPager = await factory.build('folioPager')
  fragmentService = {
    find: jest.fn(),
    findFolio: jest.fn(),
    folioPager: jest.fn(),
    isAllowedToRead: jest.fn(),
    isAllowedToTransliterate: jest.fn(),
    isAllowedToLemmatize: () => false
  }
  URL.createObjectURL.mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
})

describe('Fragment is loaded', () => {
  let fragment
  let selectedFolio

  beforeEach(async () => {
    const folios = await factory.buildMany('folio', 2, {}, [{ name: 'WGL' }, { name: 'AKG' }])
    fragment = await factory.build('fragment', { _id: fragmentNumber, folios: folios, atf: '1. ku' })
    selectedFolio = fragment.folios[1]
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment))
    fragmentService.isAllowedToRead.mockReturnValue(true)
    fragmentService.isAllowedToTransliterate.mockReturnValue(true)
    renderFragmentView(`/${encodeURIComponent(fragmentNumber)}?folioName=${encodeURIComponent(selectedFolio.name)}&folioNumber=${encodeURIComponent(selectedFolio.number)}`)
    await waitForElement(() => element.getByText('Edition'))
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
    expect(element.getByText(`${selectedFolio.humanizedName} Folio ${selectedFolio.number}`)).toHaveAttribute('aria-selected', 'true')
  })
})

describe('On error', () => {
  beforeEach(() => {
    fragmentService.isAllowedToRead.mockReturnValue(true)
    fragmentService.isAllowedToTransliterate.mockReturnValue(true)
    fragmentService.find.mockReturnValueOnce(Promise.reject(new Error(message)))
    renderFragmentView()
  })

  it('Shows the error message', async () => {
    await waitForElement(() => element.getByText(message))
  })

  it('Shows the fragment number', async () => {
    await waitForElement(() => element.getByText(fragmentNumber))
  })
})

it('Displays a message if user is not logged in', async () => {
  fragmentService.isAllowedToRead.mockReturnValue(false)
  fragmentService.isAllowedToTransliterate.mockReturnValue(false)
  renderFragmentView()
  await waitForElement(() => element.getByText('You do not have the rights access the fragmentarium.'))
})
