import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession, { Session } from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import Fragmentarium from './Fragmentarium'
import Promise from 'bluebird'
import Bluebird from 'bluebird'
import {
  fragmentInfoFactory,
  statisticsFactory,
} from 'test-support/fragment-fixtures'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('fragmentarium/application/FragmentService')
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const fragmentSearchService = new (FragmentSearchService as jest.Mock<
  jest.Mocked<FragmentSearchService>
>)()

let session: Session
let container: Element
let element: RenderResult
let statistics: { transliteratedFragments: number; lines: number }
async function renderFragmentarium() {
  const FragmentariumWithRouter = withRouter<any, typeof Fragmentarium>(
    Fragmentarium
  )
  element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <FragmentariumWithRouter
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  container = element.container
  await element.findByText('Current size of the corpus:')
}

beforeEach(() => {
  statistics = statisticsFactory.build()
  fragmentService.statistics.mockReturnValue(Bluebird.resolve(statistics))
})

describe('Statistics', () => {
  beforeEach(async () => {
    session = new MemorySession([])
    await renderFragmentarium()
  })
  it('Shows the number of transliterated tablets', async () => {
    expect(container).toHaveTextContent(
      statistics.transliteratedFragments.toLocaleString()
    )
  })
  it('Shows the number of transliterated lines', async () => {
    expect(container).toHaveTextContent(statistics.lines.toLocaleString())
  })
})

describe('Fragment lists', () => {
  let latest: FragmentInfo
  let needsRevision: FragmentInfo

  beforeEach(async () => {
    latest = fragmentInfoFactory.build()
    session = new MemorySession(['read:fragments', 'transliterate:fragments'])
    fragmentSearchService.fetchLatestTransliterations.mockReturnValueOnce(
      Promise.resolve([latest])
    )
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
