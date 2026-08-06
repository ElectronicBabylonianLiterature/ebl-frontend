import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import CuneiformFragment from 'fragmentarium/ui/fragment/CuneiformFragment'
import Lemmatization from 'transliteration/domain/Lemmatization'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioPagerFactory } from 'test-support/fragment-data-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import DossiersService from 'dossiers/application/DossiersService'

export interface CuneiformFragmentTestContext {
  fragment: Fragment
  updatedFragment: Fragment
  container: HTMLElement
  fragmentService: jest.Mocked<FragmentService>
  fragmentSearchService: jest.Mocked<FragmentSearchService>
  wordService: jest.Mocked<WordService>
  findspotService: jest.Mocked<FindspotService>
  afoRegisterService: jest.Mocked<AfoRegisterService>
  dossiersService: jest.Mocked<DossiersService>
  session: jest.Mocked<Session>
}

export async function setUpCuneiformFragment(): Promise<CuneiformFragmentTestContext> {
  const folioPager = folioPagerFactory.build()
  const references = referenceFactory.buildList(2)
  const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  const fragment = fragmentFactory
    .build({
      atf: '1. ku',
      hasPhoto: true,
      collection: 'Sippar',
    })
    .setReferences(referenceFactory.buildList(2))
  const updatedFragment = fragmentFactory
    .build({
      number: fragment.number,
      atf: fragment.atf,
      date: {
        year: { value: '3' },
        month: { value: '3' },
        day: { value: '3' },
        isSeleucidEra: true,
      },
      datesInText: [
        {
          year: { value: '2' },
          month: { value: '2' },
          day: { value: '2' },
          isSeleucidEra: true,
        },
      ],
    })
    .setReferences(references)
  const fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentService.createLemmatization.mockImplementation(() =>
    Promise.resolve(new Lemmatization([], [])),
  )
  fragmentService.findInCorpus.mockReturnValue(
    Promise.resolve({
      manuscriptAttestations: [],
      uncertainFragmentAttestations: [],
    }),
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
  const session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()

  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  session.isAllowedToLemmatizeFragments.mockReturnValue(false)
  session.hasBetaAccess.mockReturnValue(false)
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' })),
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' })),
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
  fragmentService.fetchGenres.mockReturnValue(
    Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']]),
  )
  fragmentService.fetchPeriods.mockReturnValue(Promise.resolve([]))
  fragmentService.updateGenres.mockReturnValue(Promise.resolve(fragment))
  fragmentService.updateDate.mockReturnValue(Promise.resolve(fragment))
  fragmentService.updateDatesInText.mockReturnValue(Promise.resolve(fragment))

  const container = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <CuneiformFragment
          fragment={fragment}
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
          wordService={wordService}
          findspotService={findspotService}
          afoRegisterService={afoRegisterService}
          dossiersService={dossiersService}
          activeLine=""
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  ).container
  await screen.findAllByText('Photo')

  return {
    fragment: fragment,
    updatedFragment: updatedFragment,
    container: container,
    fragmentService: fragmentService,
    fragmentSearchService: fragmentSearchService,
    wordService: wordService,
    findspotService: findspotService,
    afoRegisterService: afoRegisterService,
    dossiersService: dossiersService,
    session: session,
  }
}
