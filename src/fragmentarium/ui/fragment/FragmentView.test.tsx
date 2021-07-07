import React from 'react'
import { factory } from 'factory-girl'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import FragmentView from './FragmentView'
import Lemmatization from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import { act } from 'react-dom/test-utils'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession from 'auth/Session'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import {
  folioFactory,
  folioPagerFactory,
  fragmentFactory,
} from 'test-support/fragment-fixtures'
import { FragmentPagerData } from 'fragmentarium/domain/pager'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')

const message = 'message'
const fragmentNumber = 'K,K.1'

let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let wordService: jest.Mocked<WordService>
let session
let container: HTMLElement
let element: RenderResult

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
            wordService={wordService}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    )
    container = element.container
  })
}

beforeEach(async () => {
  const folioPager = folioPagerFactory.build()
  const fragmentPagerData: FragmentPagerData = {
    next: 'K.00001',
    previous: 'J.99999',
  }
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const word = await factory.build('word')
  wordService.find.mockReturnValue(Promise.resolve(word))
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentService.createLemmatization.mockReturnValue(
    Promise.resolve(new Lemmatization([], []))
  )
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    })
  )
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  session = new MemorySession(['read:fragments'])
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
  fragmentService.fetchGenres.mockReturnValue(
    Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']])
  )
})

describe('Fragment is loaded', () => {
  let fragment
  let selectedFolio

  beforeEach(async () => {
    const folios = [
      folioFactory.build({ name: 'WGL' }),
      folioFactory.build({ name: 'AKG' }),
    ]
    fragment = fragmentFactory
      .build(
        {
          number: fragmentNumber,
          atf: '1. ku',
          hasPhoto: true,
        },
        { associations: { folios: folios } }
      )
      .setReferences(referenceFactory.buildList(2))
    selectedFolio = fragment.folios[0]
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment))
    fragmentService.updateGenres.mockReturnValue(Promise.resolve(fragment))
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
    expect(element.getByText('Tag signs')).not.toHaveAttribute('aria-disabled')
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
    const fragment = fragmentFactory.build(
      {
        number: fragmentNumber,
        atf: '1. ku',
        hasPhoto: false,
      },
      { associations: { folios: [], references: [] } }
    )
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment))
    await renderFragmentView(fragment.number, null, null, null)
    await element.findByText('Display')
  })

  it('Tag signs button is disabled', () => {
    expect(element.getByText('Tag signs')).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})

describe('On error', () => {
  beforeEach(async () => {
    fragmentService.find.mockReturnValueOnce(Promise.reject(new Error(message)))
    await renderFragmentView(fragmentNumber, null, null, null)
  })

  it('Shows the error message', async () => {
    await element.findByText(message)
  })
})
