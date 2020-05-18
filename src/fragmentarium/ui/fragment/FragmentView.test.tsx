import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import FragmentView from './FragmentView'
import Lemmatization from 'transliteration/domain/Lemmatization'
import { CdliInfo } from 'fragmentarium/application/FragmentService'
import { act } from 'react-dom/test-utils'

const message = 'message'
const fragmentNumber = 'K,K.1'

let fragmentService
let fragmentSearchService
let session
let container
let element

async function renderFragmentView(
  number: string,
  folioName: string | null,
  folioNumber: string | null,
  tab: string | null
): Promise<void> {
  await act(async () => {
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
  })
}

beforeEach(async () => {
  const folioPager = await factory.build('folioPager')
  const fragmentPagerData = {
    next: { fragmentNumber: 'K.00001' },
    previous: { fragmentNumber: 'J.99999' },
  }
  fragmentService = {
    find: jest.fn(),
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    folioPager: jest.fn(),
    fragmentPager: jest.fn(),
    createLemmatization: (text: Text): Promise<Lemmatization> =>
      Promise.resolve(new Lemmatization([], [])),
    fetchCdliInfo: (): Promise<CdliInfo> =>
      Promise.resolve({
        photoUrl: null,
        lineArtUrl: null,
        detailLineArtUrl: null,
      }),
  }
  fragmentSearchService = {}
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: (): boolean => false,
    isAllowedToLemmatizeFragments: (): boolean => false,
    hasBetaAccess: (): boolean => false,
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
      { name: 'AKG' },
    ])
    fragment = (
      await factory.build('fragment', {
        number: fragmentNumber,
        folios: folios,
        atf: '1. ku',
        hasPhoto: true,
      })
    ).setReferences(await factory.buildMany('reference', 2))
    selectedFolio = fragment.folios[0]
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment))
    session.isAllowedToReadFragments.mockReturnValue(true)
    await renderFragmentView(
      fragmentNumber,
      selectedFolio.name,
      selectedFolio.number,
      'folio'
    )
    await element.findByText('Display')
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    expect(fragmentService.find).toBeCalledWith(fragmentNumber)
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })

  it('Shows pager', () => {
    expect(element.getByLabelText('Next')).toBeVisible()
  })

  it('Shows annotate button', () => {
    expect(element.getByText('Annotate Fragment Image')).not.toHaveAttribute(
      'aria-disabled'
    )
  })

  it('Selects active folio', () => {
    expect(
      element.getByText(
        `${selectedFolio.humanizedName} Folio ${selectedFolio.number}`
      )
    ).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Fragment without an image is loaded', () => {
  beforeEach(async () => {
    const fragment = await factory.build('fragment', {
      number: fragmentNumber,
      folios: [],
      atf: '1. ku',
      hasPhoto: false,
      references: [],
    })
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment))
    session.isAllowedToReadFragments.mockReturnValue(true)
    await renderFragmentView(fragment.number, null, null, null)
    await element.findByText('Display')
  })

  it('Annotate button is disabled', () => {
    expect(element.getByText('Annotate Fragment Image')).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})

describe('On error', () => {
  beforeEach(async () => {
    session.isAllowedToReadFragments.mockReturnValue(true)
    fragmentService.find.mockReturnValueOnce(Promise.reject(new Error(message)))
    await renderFragmentView(fragmentNumber, null, null, null)
  })

  it('Shows the error message', async () => {
    await element.findByText(message)
  })
})
