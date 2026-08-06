import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import FragmentView from 'fragmentarium/ui/fragment/FragmentView'
import Lemmatization from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { folioPagerFactory } from 'test-support/fragment-data-fixtures'
import { FragmentPagerData } from 'fragmentarium/domain/pager'
import { wordFactory } from 'test-support/word-fixtures'
import { helmetContext } from 'router/head'
import { HelmetProvider } from 'react-helmet-async'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import DossiersService from 'dossiers/application/DossiersService'

export const fragmentNumber = 'K,K.1'

export interface FragmentViewTestContext {
  fragmentService: jest.Mocked<FragmentService>
  fragmentSearchService: jest.Mocked<FragmentSearchService>
  wordService: jest.Mocked<WordService>
  findspotService: jest.Mocked<FindspotService>
  afoRegisterService: jest.Mocked<AfoRegisterService>
  dossiersService: jest.Mocked<DossiersService>
  session: Session
  container: HTMLElement
  renderFragmentView: (
    number: string,
    folioName: string | null,
    folioNumber: string | null,
    tab: string | null,
  ) => void
}

export function createFragmentViewTestContext(): FragmentViewTestContext {
  const folioPager = folioPagerFactory.build()
  const fragmentPagerData: FragmentPagerData = {
    next: 'K.00001',
    previous: 'J.99999',
  }
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const word = wordFactory.build()
  wordService.find.mockReturnValue(Promise.resolve(word))
  wordService.findAll.mockResolvedValue([
    word,
    wordFactory.build({ _id: 'hepû II' }),
  ])
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentService.createLemmatization.mockReturnValue(
    Promise.resolve(new Lemmatization([], [])),
  )
  const fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  const findspotService = new (FindspotService as jest.Mock<
    jest.Mocked<FindspotService>
  >)()
  const afoRegisterService = new (AfoRegisterService as jest.Mock<
    jest.Mocked<AfoRegisterService>
  >)()
  const dossiersService = new (DossiersService as jest.Mock<
    jest.Mocked<DossiersService>
  >)()
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

  const context: FragmentViewTestContext = {
    fragmentService: fragmentService,
    fragmentSearchService: fragmentSearchService,
    wordService: wordService,
    findspotService: findspotService,
    afoRegisterService: afoRegisterService,
    dossiersService: dossiersService,
    session: new MemorySession([
      'read:fragments',
      'read:WGL-folios',
      'read:AKG-folios',
    ]),
    container: document.createElement('div'),
    renderFragmentView: (number, folioName, folioNumber, tab): void => {
      context.container = render(
        <HelmetProvider context={helmetContext}>
          <MemoryRouter>
            <SessionContext.Provider value={context.session}>
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
                  session={context.session}
                />
              </DictionaryContext.Provider>
            </SessionContext.Provider>
          </MemoryRouter>
        </HelmetProvider>,
      ).container
    },
  }

  return context
}
