import React from 'react'
import { render, screen } from '@testing-library/react'
import Chance from 'chance'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import LatestTransliterations from './LatestTransliterations'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import { queryItemOf } from 'test-support/utils'
import DossiersService from 'dossiers/application/DossiersService'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')
jest.mock('dossiers/application/DossiersService')

const chance = new Chance('latest-test')

const numberOfFragments = 2
let container: HTMLElement
let fragments: Fragment[]
let session: Session

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()

const setup = async (): Promise<void> => {
  session = new MemorySession(['read:fragments'])
  fragments = fragmentFactory.buildList(
    numberOfFragments,
    {},
    { transient: { chance } },
  )
  fragmentService.queryLatest.mockReturnValueOnce(
    Promise.resolve({
      items: fragments.map(queryItemOf),
      matchCountTotal: 0,
    }),
  )
  fragmentService.find
    .mockReturnValueOnce(Promise.resolve(fragments[0]))
    .mockReturnValueOnce(Promise.resolve(fragments[1]))
  fragmentService.findThumbnail.mockResolvedValue({ blob: null })

  dossiersService.queryByIds.mockResolvedValue([])
  container = render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <SessionContext.Provider value={session}>
          <LatestTransliterations
            fragmentService={fragmentService}
            dossiersService={dossiersService}
          />
        </SessionContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>,
  ).container
  await screen.findByText('Latest additions:')
}

test('Snapshot', async () => {
  await setup()
  expect(container).toMatchSnapshot()
})
