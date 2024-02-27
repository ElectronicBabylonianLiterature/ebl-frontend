import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import Fragmentarium from './Fragmentarium'
import Promise from 'bluebird'
import Bluebird from 'bluebird'
import {
  fragmentFactory,
  fragmentInfoFactory,
  statisticsFactory,
} from 'test-support/fragment-fixtures'
import { Fragment, FragmentInfo } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import { queryItemOf } from 'test-support/utils'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('dictionary/application/WordService')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const fragmentSearchService = new (FragmentSearchService as jest.Mock<
  jest.Mocked<FragmentSearchService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

let session: Session
let container: Element
let statistics: { transliteratedFragments: number; lines: number }
async function renderFragmentarium() {
  const FragmentariumWithRouter = withRouter<any, typeof Fragmentarium>(
    Fragmentarium
  )
  container = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <DictionaryContext.Provider value={wordService}>
          <FragmentariumWithRouter
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            wordService={wordService}
          />
        </DictionaryContext.Provider>
      </SessionContext.Provider>
    </MemoryRouter>
  ).container
  await screen.findByText('Current size of the corpus:')
}

beforeEach(() => {
  statistics = statisticsFactory.build()
  fragmentService.statistics.mockReturnValue(Bluebird.resolve(statistics))
  wordService.findAll.mockReturnValue(Promise.resolve([]))
  fragmentService.fetchPeriods.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.fetchGenres.mockReturnValueOnce(Promise.resolve([]))
  fragmentService.fetchProvenances.mockRejectedValueOnce(Promise.resolve([]))
})

describe('Statistics', () => {
  beforeEach(async () => {
    session = new MemorySession([])
    await renderFragmentarium()
  })
  it('Shows the number of transliterated tablets', () => {
    expect(container).toHaveTextContent(
      statistics.transliteratedFragments.toLocaleString()
    )
  })
  it('Shows the number of transliterated lines', () => {
    expect(container).toHaveTextContent(statistics.lines.toLocaleString())
  })
})

describe('Fragment lists', () => {
  let latest: Fragment
  let needsRevision: FragmentInfo

  beforeEach(async () => {
    latest = fragmentFactory.build()
    session = new MemorySession(['read:fragments', 'transliterate:fragments'])
    fragmentService.queryLatest.mockReturnValueOnce(
      Promise.resolve({ items: [queryItemOf(latest)], matchCountTotal: 0 })
    )
    fragmentService.find.mockReturnValueOnce(Promise.resolve(latest))
    needsRevision = fragmentInfoFactory.build()
    fragmentSearchService.fetchNeedsRevision.mockReturnValue(
      Promise.resolve([needsRevision])
    )
    await renderFragmentarium()
  })

  test('Shows the latest additions', () => {
    expect(container).toHaveTextContent(latest.number)
  })

  test('Shows the fragments needing revision.', () => {
    expect(container).toHaveTextContent(needsRevision.number)
  })
})
