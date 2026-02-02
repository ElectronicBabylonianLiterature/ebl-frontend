import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
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
    location: { pathname: '/library' },
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

describe('Fragmentarium', () => {
  const initialStatistics = statisticsFactory.build()
  let session: Session
  let container: HTMLElement

  const renderFragmentarium = async (): Promise<void> => {
    const { container: renderedContainer } = render(
      <MemoryRouter initialEntries={['/library']}>
        <SessionContext.Provider value={session}>
          <DictionaryContext.Provider value={wordService}>
            <Fragmentarium
              fragmentService={fragmentService}
              fragmentSearchService={fragmentSearchService}
              wordService={wordService}
              dossiersService={dossiersService}
              bibliographyService={bibliographyService}
            />
          </DictionaryContext.Provider>
        </SessionContext.Provider>
      </MemoryRouter>,
    )
    container = renderedContainer
    await screen.findByText('Current size of the Library:')
  }

  const mockAllServiceMethods = (): void => {
    ;[
      fragmentService,
      fragmentSearchService,
      wordService,
      dossiersService,
      bibliographyService,
    ].forEach((service) => {
      Object.keys(service).forEach((key) => {
        if (typeof service[key] === 'function') {
          service[key].mockReturnValue(Bluebird.resolve())
        }
      })
    })
  }

  const testStatisticDisplay = (
    description: string,
    statisticValue: number,
    setup: () => Promise<void>,
  ): void => {
    it(description, async () => {
      await setup()
      expect(container).toHaveTextContent(statisticValue.toLocaleString())
    })
  }

  beforeEach(() => {
    mockAllServiceMethods()
    fragmentService.statistics.mockReturnValue(
      Bluebird.resolve(initialStatistics),
    )
    wordService.findAll.mockReturnValue(Bluebird.resolve([]))
    fragmentService.fetchPeriods.mockReturnValue(Bluebird.resolve([]))
    fragmentService.fetchGenres.mockReturnValue(Bluebird.resolve([]))
    fragmentService.fetchProvenances.mockReturnValue(Bluebird.resolve([]))
  })

  describe('Statistics', () => {
    const setupStatistics = async (): Promise<void> => {
      session = new MemorySession([])
      await renderFragmentarium()
    }

    testStatisticDisplay(
      'Shows the number of indexed tablets',
      initialStatistics.totalFragments,
      setupStatistics,
    )
    testStatisticDisplay(
      'Shows the number of transliterated tablets',
      initialStatistics.transliteratedFragments,
      setupStatistics,
    )

    it('shows the ApiImage when advanced search is closed', async () => {
      await setupStatistics()
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
  })

  describe('Fragment lists', () => {
    let latest: Fragment
    let needsRevision: FragmentInfo

    const setupFragmentLists = async (): Promise<void> => {
      latest = fragmentFactory.build()
      session = new MemorySession(['read:fragments', 'transliterate:fragments'])
      fragmentService.queryLatest.mockReturnValue(
        Bluebird.resolve({ items: [queryItemOf(latest)], matchCountTotal: 0 }),
      )
      fragmentService.find.mockReturnValue(Bluebird.resolve(latest))
      needsRevision = fragmentInfoFactory.build()
      fragmentSearchService.fetchNeedsRevision.mockReturnValue(
        Bluebird.resolve([needsRevision]),
      )
      await renderFragmentarium()
    }

    it('shows the latest additions', async () => {
      await setupFragmentLists()
      expect(
        await screen.findByRole('link', { name: latest.number }),
      ).toBeInTheDocument()
    })

    it('shows the fragments needing revision', async () => {
      await setupFragmentLists()
      expect(
        await screen.findByRole('link', { name: needsRevision.number }),
      ).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('does not render LatestTransliterations when user cannot read fragments', async () => {
      session = new MemorySession([])
      await renderFragmentarium()
      expect(
        screen.queryByText('Latest Transliterations'),
      ).not.toBeInTheDocument()
    })

    it('does not render NeedsRevision when user cannot transliterate fragments', async () => {
      session = new MemorySession(['read:fragments'])
      await renderFragmentarium()
      expect(screen.queryByText('Needs Revision')).not.toBeInTheDocument()
    })
  })
})
