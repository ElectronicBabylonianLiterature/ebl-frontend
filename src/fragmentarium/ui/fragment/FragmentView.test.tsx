import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import FragmentView from './FragmentView'
import Lemmatization from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession from 'auth/Session'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  folioPagerFactory,
  folioFactory,
} from 'test-support/fragment-data-fixtures'
import { FragmentPagerData } from 'fragmentarium/domain/pager'
import { wordFactory } from 'test-support/word-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import { helmetContext } from 'router/head'
import { HelmetProvider } from 'react-helmet-async'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import DossiersService from 'dossiers/application/DossiersService'
import ResizeObserver from 'resize-observer-polyfill'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('dossiers/application/DossiersService')

global.ResizeObserver = ResizeObserver

const message = 'message'
const fragmentNumber = 'K,K.1'

let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let wordService: jest.Mocked<WordService>
let findspotService: jest.Mocked<FindspotService>
let afoRegisterService: jest.Mocked<AfoRegisterService>
let dossiersService: jest.Mocked<DossiersService>
let session
let container: HTMLElement

function renderFragmentView(
  number: string,
  folioName: string | null,
  folioNumber: string | null,
  tab: string | null,
) {
  container = render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <DictionaryContext.Provider value={wordService}>
            <FragmentView
              number={number}
              folioName={folioName}
              folioNumber={folioNumber}
              tab={tab}
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
              wordService={wordService}
              findspotService={findspotService}
              afoRegisterService={afoRegisterService}
              dossiersService={dossiersService}
              activeLine=""
              session={session}
            />
          </DictionaryContext.Provider>
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  ).container
}

beforeEach(() => {
  const folioPager = folioPagerFactory.build()
  const fragmentPagerData: FragmentPagerData = {
    next: 'K.00001',
    previous: 'J.99999',
  }
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const word = wordFactory.build()
  wordService.find.mockReturnValue(Promise.resolve(word))
  wordService.findAll.mockResolvedValue([
    word,
    wordFactory.build({ _id: 'hepû II' }),
  ])
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentService.createLemmatization.mockReturnValue(
    Promise.resolve(new Lemmatization([], [])),
  )
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  findspotService = new (FindspotService as jest.Mock<
    jest.Mocked<FindspotService>
  >)()
  afoRegisterService = new (AfoRegisterService as jest.Mock<
    jest.Mocked<AfoRegisterService>
  >)()
  dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
  session = new MemorySession([
    'read:fragments',
    'read:WGL-folios',
    'read:AKG-folios',
  ])
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' })),
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' })),
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
  fragmentService.fragmentPager.mockReturnValue(
    Promise.resolve(fragmentPagerData),
  )
  fragmentService.fetchGenres.mockReturnValue(
    Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']]),
  )
  fragmentService.fetchPeriods.mockReturnValue(Promise.resolve([]))
  fragmentService.findInCorpus.mockResolvedValue({
    manuscriptAttestations: [],
    uncertainFragmentAttestations: [],
  })
  afoRegisterService.searchTextsAndNumbers.mockResolvedValue([])
  dossiersService.queryByIds.mockResolvedValue([])
})

describe('Fragment is loaded', () => {
  let fragment
  let selectedFolio

  async function renderAndWaitForLoadedFragment(): Promise<void> {
    renderFragmentView(
      fragmentNumber,
      selectedFolio.name,
      selectedFolio.number,
      'folio',
    )
    await waitForSpinnerToBeRemoved(screen)
  }

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
        { associations: { folios: folios } },
      )
      .setReferences(referenceFactory.buildList(2))
    selectedFolio = fragment.folios[0]
    fragmentService.find.mockReturnValue(Promise.resolve(fragment))
    fragmentService.updateGenres.mockReturnValue(Promise.resolve(fragment))
  })

  it('Queries the Fragmentarium API with given parameters', async () => {
    await renderAndWaitForLoadedFragment()
    expect(fragmentService.find).toBeCalledWith(fragmentNumber)
  })

  it('Shows the fragment number', async () => {
    await renderAndWaitForLoadedFragment()
    expect(container).toHaveTextContent(fragmentNumber)
  })

  it('Shows pager', async () => {
    await renderAndWaitForLoadedFragment()
    expect(screen.getByLabelText('Next')).toBeVisible()
  })

  it('Shows annotate button', async () => {
    await renderAndWaitForLoadedFragment()
    expect(screen.getByText('Tag signs')).not.toHaveAttribute('aria-disabled')
  })

  it('Selects active folio', async () => {
    await renderAndWaitForLoadedFragment()
    expect(
      screen.getByText(
        `${selectedFolio.humanizedName} Folio ${selectedFolio.number}`,
      ),
    ).toHaveAttribute('aria-selected', 'true')
  })
})

describe('Fragment without an image is loaded', () => {
  let fragment: Fragment

  async function renderAndWaitForFragment(): Promise<void> {
    renderFragmentView(fragment.number, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(async () => {
    fragment = fragmentFactory.build(
      {
        number: fragmentNumber,
        atf: '1. ku',
        hasPhoto: false,
      },
      { associations: { folios: [], references: [] } },
    )
    fragmentService.find.mockReturnValue(Promise.resolve(fragment))
  })

  it('Tag signs button is disabled', async () => {
    await renderAndWaitForFragment()
    expect(screen.getByText('Tag signs')).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})

describe('On error', () => {
  it('Shows the error message', async () => {
    fragmentService.find.mockReturnValue(Promise.reject(new Error(message)))
    renderFragmentView(fragmentNumber, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
    await screen.findByText(message)
  })
})

describe('Filter folios', () => {
  let fragment: Fragment
  let folios: readonly Folio[]
  const openFolios: readonly Folio[] = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]

  async function renderAndWaitForFragment(): Promise<void> {
    renderFragmentView(fragment.number, null, null, null)
    await waitForSpinnerToBeRemoved(screen)
  }

  beforeEach(async () => {
    session = new MemorySession(['read:WGL-folios', 'read:AKG-folios'])
    folios = [
      ...openFolios,
      folioFactory.build({}, { associations: { name: 'WRM' } }),
    ]
    fragment = fragmentFactory.build(
      {
        number: fragmentNumber,
        atf: '1. ku',
        hasPhoto: true,
      },
      { associations: { folios: folios } },
    )
    fragmentService.find.mockReturnValue(Promise.resolve(fragment))
  })

  it("excludes folios the user doesn't have access to", async () => {
    expect(fragment.filterFolios(session).folios).toEqual(openFolios)
  })

  it.each(openFolios)('shows the included folio %#', async (folio) => {
    await renderAndWaitForFragment()
    expect(
      screen.getByText(`${folio.humanizedName} Folio ${folio.number}`),
    ).toBeVisible()
  })

  it('Does not show the excluded folios', async () => {
    await renderAndWaitForFragment()
    expect(
      screen.queryByText(
        `${folios[2].humanizedName} Folio ${folios[2].number}`,
      ),
    ).not.toBeInTheDocument()
  })
})
