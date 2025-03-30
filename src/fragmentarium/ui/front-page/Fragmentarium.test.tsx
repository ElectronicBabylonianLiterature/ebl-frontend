import React from 'react'
import { MemoryRouter, withRouter, RouteComponentProps } from 'react-router-dom'
import { render, screen, fireEvent, act } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import Fragmentarium from './Fragmentarium'
import Bluebird from 'bluebird'
import {
  fragmentFactory,
  fragmentInfoFactory,
} from 'test-support/fragment-fixtures'
import { statisticsFactory } from 'test-support/fragment-data-fixtures'
import { Fragment, FragmentInfo } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { queryItemOf } from 'test-support/utils'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import DossiersService from 'dossiers/application/DossiersService'
import BibliographyService from 'bibliography/application/BibliographyService'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('dossiers/application/DossiersService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
    location: { pathname: '/library', state: { isAdvancedSearchOpen: false } },
  }),
}))

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const fragmentSearchService = new (FragmentSearchService as jest.Mock<
  jest.Mocked<FragmentSearchService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()
const bibliographyService = new (BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>)()

let session: Session
let statistics: { transliteratedFragments: number; lines: number }

type FragmentariumProps = RouteComponentProps & {
  fragmentService: jest.Mocked<FragmentService>
  fragmentSearchService: jest.Mocked<FragmentSearchService>
  wordService: jest.Mocked<WordService>
  dossiersService: jest.Mocked<DossiersService>
  bibliographyService: jest.Mocked<BibliographyService>
}

async function renderFragmentarium(): Promise<void> {
  const FragmentariumWithRouter = withRouter<
    FragmentariumProps,
    typeof Fragmentarium
  >(Fragmentarium)
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/library']}>
        <SessionContext.Provider value={session}>
          <DictionaryContext.Provider value={wordService}>
            <FragmentariumWithRouter
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
              wordService={wordService}
              dossiersService={dossiersService}
              bibliographyService={bibliographyService}
            />
          </DictionaryContext.Provider>
        </SessionContext.Provider>
      </MemoryRouter>
    )
  })
  await screen.findByText('Current size of the corpus:')
}

function mockAllServiceMethods(): void {
  ;[
    fragmentService,
    fragmentSearchService,
    wordService,
    dossiersService,
    bibliographyService,
  ].forEach((service) => {
    Object.keys(service).forEach((key) => {
      if (typeof service[key] === 'function') {
        service[key].mockResolvedValue(Bluebird.resolve())
      }
    })
  })
}

beforeEach(() => {
  statistics = statisticsFactory.build()
  mockAllServiceMethods()

  fragmentService.statistics.mockResolvedValue(Bluebird.resolve(statistics))
  wordService.findAll.mockResolvedValue(Bluebird.resolve([]))
  fragmentService.fetchPeriods.mockResolvedValue(Bluebird.resolve([]))
  fragmentService.fetchGenres.mockResolvedValue(Bluebird.resolve([]))
  fragmentService.fetchProvenances.mockResolvedValue(Bluebird.resolve([]))
})

describe('Statistics', () => {
  beforeEach(async () => {
    session = new MemorySession([])
    await renderFragmentarium()
  })

  it('shows the number of transliterated tablets', () => {
    expect(
      screen.getByText(statistics.transliteratedFragments.toLocaleString())
    ).toBeInTheDocument()
  })

  it('shows the number of transliterated lines', () => {
    expect(
      screen.getByText(statistics.lines.toLocaleString())
    ).toBeInTheDocument()
  })

  it('shows the ApiImage when advanced search is closed', () => {
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})

describe('Fragment lists', () => {
  let latest: Fragment
  let needsRevision: FragmentInfo

  beforeEach(async () => {
    latest = fragmentFactory.build()
    session = new MemorySession(['read:fragments', 'transliterate:fragments'])
    fragmentService.queryLatest.mockResolvedValue(
      Bluebird.resolve({ items: [queryItemOf(latest)], matchCountTotal: 0 })
    )
    fragmentService.find.mockResolvedValue(Bluebird.resolve(latest))
    needsRevision = fragmentInfoFactory.build()
    fragmentSearchService.fetchNeedsRevision.mockResolvedValue(
      Bluebird.resolve([needsRevision])
    )
    await renderFragmentarium()
  })

  it('shows the latest additions', () => {
    expect(screen.getByText(latest.number)).toBeInTheDocument()
  })

  it('shows the fragments needing revision', () => {
    expect(screen.getByText(needsRevision.number)).toBeInTheDocument()
  })
})

describe('Advanced Search', () => {
  beforeEach(async () => {
    session = new MemorySession(['read:fragments'])
    await renderFragmentarium()
  })

  it('hides the ApiImage when advanced search is open', async () => {
    expect(screen.getByRole('img')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText('Advanced Search'))
    })

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('expands the SearchForm to full width when advanced search is open', async () => {
    expect(screen.getByRole('img')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText('Advanced Search'))
    })

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('Conditional Rendering', () => {
  it('does not render LatestTransliterations when user cannot read fragments', async () => {
    session = new MemorySession([])
    await renderFragmentarium()

    expect(
      screen.queryByText('Latest Transliterations')
    ).not.toBeInTheDocument()
  })

  it('does not render NeedsRevision when user cannot transliterate fragments', async () => {
    session = new MemorySession(['read:fragments'])
    await renderFragmentarium()

    expect(screen.queryByText('Needs Revision')).not.toBeInTheDocument()
  })
})
