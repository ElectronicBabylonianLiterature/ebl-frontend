import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import SessionContext from 'auth/SessionContext'
import CuneiformFragment from './CuneiformFragment'
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
import ResizeObserver from 'resize-observer-polyfill'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('afo-register/application/AfoRegisterService')
jest.mock('auth/Session')

global.ResizeObserver = ResizeObserver
export let fragment: Fragment
export let container: HTMLElement
export let fragmentService: jest.Mocked<FragmentService>
export let fragmentSearchService: jest.Mocked<FragmentSearchService>
export let wordService: jest.Mocked<WordService>
export let findspotService: jest.Mocked<FindspotService>
export let afoRegisterService: jest.Mocked<AfoRegisterService>
export let dossiersService: jest.Mocked<DossiersService>
export let session: jest.Mocked<Session>
export let updatedFragment: Fragment

export const setup = async (): Promise<void> => {
  const folioPager = folioPagerFactory.build()
  const references = referenceFactory.buildList(2)
  wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
  fragment = fragmentFactory
    .build({
      atf: '1. ku',
      hasPhoto: true,
      collection: 'Sippar',
    })
    .setReferences(referenceFactory.buildList(2))
  updatedFragment = fragmentFactory
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
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentService.createLemmatization.mockReturnValue(
    Promise.resolve(new Lemmatization([], [])),
  )
  fragmentService.findInCorpus.mockReturnValue(
    Promise.resolve({
      manuscriptAttestations: [],
      uncertainFragmentAttestations: [],
    }),
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
  session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()

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
  container = render(
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
}

test.each(['collection', 'accession'])('Renders %s', async (property) => {
  await setup()
  expect(container).toHaveTextContent(fragment[property])
})
