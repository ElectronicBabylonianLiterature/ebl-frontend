import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { submitFormByTestId, clickNth } from 'test-support/utils'
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
let fragment: Fragment
let container: HTMLElement
let fragmentService: jest.Mocked<FragmentService>
let fragmentSearchService: jest.Mocked<FragmentSearchService>
let wordService: jest.Mocked<WordService>
let findspotService: jest.Mocked<FindspotService>
let afoRegisterService: jest.Mocked<AfoRegisterService>
let dossiersService: jest.Mocked<DossiersService>
let session: jest.Mocked<Session>
let updatedFragment: Fragment

const setup = async () => {
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
  fragmentService.createLemmatization.mockImplementation((text) =>
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

it('Renders CDLI number', async () => {
  await setup()
  expect(container).toHaveTextContent(fragment.getExternalNumber('cdliNumber'))
})

it('Renders museum', async () => {
  await setup()
  expect(container).toHaveTextContent(fragment.museum.name)
})

it('Renders all joins', async () => {
  await setup()
  for (const join of fragment.joins.flat()) {
    expect(
      screen.getByText(new RegExp(_.escapeRegExp(join.museumNumber))),
    ).toBeInTheDocument()
  }
})

it('Renders all measures', async () => {
  await setup()
  for (const property of ['length', 'width', 'thickness']) {
    expect(container).toHaveTextContent(fragment.measures[property])
  }
})

it('Renders all references', async () => {
  await setup()
  for (const reference of fragment.references) {
    expect(container).toHaveTextContent(reference.primaryAuthor)
  }
})

it('Renders all records', async () => {
  await setup()
  for (const uniqueRecord of fragment.uniqueRecord) {
    expect(container).toHaveTextContent(uniqueRecord.user)
  }
})

it('Renders all folios', async () => {
  await setup()
  for (const folio of fragment.folios) {
    expect(container).toHaveTextContent(folio.number)
  }
})

it('Updates view on Edition save', async () => {
  await setup()
  fragmentService.updateEdition.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )

  submitFormByTestId(screen, 'transliteration-form')

  await screen.findAllByText(updatedFragment.getExternalNumber('cdliNumber'))
})

it('Updates view on References save', async () => {
  await setup()
  fragmentService.updateReferences.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )
  clickNth(screen, 'References', 1)
  await screen.findAllByText('Document')
  submitFormByTestId(screen, 'references-form')

  await screen.findByText(updatedFragment.getExternalNumber('cdliNumber'))
})

it('Calls `updateDate` on Date save', async () => {
  await setup()
  fragmentService.updateDate.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )
  const editButton = screen.getAllByLabelText('Edit date button')[0]
  fireEvent.click(editButton)
  const dayInput = screen.getByPlaceholderText('Day')
  fireEvent.change(dayInput, { target: { value: '3' } })
  const saveButton = screen.getByLabelText('Save date button')
  fireEvent.click(saveButton)
  expect(screen.getByText('Saving...')).toBeInTheDocument()
  await waitFor(() =>
    expect(fragmentService.updateDate).toHaveBeenCalledTimes(1),
  )
})

it('Calls `updateDatesInText` on Dates in text save', async () => {
  await setup()
  fragmentService.updateDatesInText.mockReturnValueOnce(
    Promise.resolve(updatedFragment),
  )
  const addButton = screen.getByLabelText('Add date button')
  fireEvent.click(addButton)
  const dayInput = screen.getByPlaceholderText('Day')
  fireEvent.change(dayInput, { target: { value: '3' } })
  const saveButton = screen.getByLabelText('Save date button')
  fireEvent.click(saveButton)
  await waitFor(() =>
    expect(fragmentService.updateDatesInText).toHaveBeenCalledTimes(1),
  )
})
