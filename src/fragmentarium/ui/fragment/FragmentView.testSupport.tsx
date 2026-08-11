import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import FragmentView from './FragmentView'
import Lemmatization from 'transliteration/domain/Lemmatization'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession from 'auth/Session'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { FragmentPagerData } from 'fragmentarium/domain/pager'
import { wordFactory } from 'test-support/word-fixtures'
import { helmetContext } from 'router/head'
import { HelmetProvider } from 'react-helmet-async'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import DossiersService from 'dossiers/application/DossiersService'
import ResizeObserver from 'resize-observer-polyfill'
import { folioPagerFactory } from 'test-support/fragment-data-fixtures'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('dossiers/application/DossiersService')

global.ResizeObserver = ResizeObserver

export const fragmentNumber = 'K,K.1'

export function createFragmentViewHarness(
  sessionScopes = ['read:fragments', 'read:WGL-folios', 'read:AKG-folios'],
) {
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
  const session = new MemorySession(sessionScopes)

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

  function renderFragmentView(
    number: string,
    folioName: string | null,
    folioNumber: string | null,
    tab: string | null,
  ) {
    return render(
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
    )
  }

  return {
    afoRegisterService,
    dossiersService,
    findspotService,
    fragmentSearchService,
    fragmentService,
    renderFragmentView,
    session,
    wordService,
  }
}
