import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import MemorySession from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import Fragmentarium from './Fragmentarium'
import Promise from 'bluebird'

const fragmentService: FragmentService = new (FragmentService as jest.Mock<
  FragmentService
>)()
const fragmentSearchService: FragmentSearchService = new (FragmentSearchService as jest.Mock<
  FragmentSearchService
>)()
const session = new (MemorySession as jest.Mock<MemorySession>)()
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

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentService.statistics = jest
    .fn()
    .mockReturnValue(Promise.resolve(statistics))
  fragmentService.findImage = jest
    .fn()
    .mockReturnValue(Promise.resolve(statistics))
  fragmentSearchService.fetchLatestTransliterations = jest.fn()

  fragmentSearchService.fetchLatestTransliterations = jest.fn()
  fragmentSearchService.fetchNeedsRevision = jest.fn()

  session.isAllowedToReadFragments = jest.fn()
  session.isAllowedToTransliterateFragments = jest.fn()
})

describe('Statistics', () => {
  beforeEach(async () => {
    session.isAllowedToReadFragments = jest.fn().mockReturnValue(false)
    session.isAllowedToTransliterateFragments = jest.fn().mockReturnValue(false)
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
  let latest
  let needsRevision

  beforeEach(async () => {
    latest = await factory.build('fragment')
    session.isAllowedToReadFragments = jest.fn().mockReturnValue(true)
    fragmentSearchService.fetchLatestTransliterations = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve([latest]))

    needsRevision = await factory.build('fragment')
    session.isAllowedToTransliterateFragments = jest.fn().mockReturnValue(true)
    fragmentSearchService.fetchNeedsRevision = jest
      .fn()
      .mockReturnValue(Promise.resolve([needsRevision]))
    await renderFragmentarium()
  })

  test('Shows the latest additions', () => {
    expect(container).toHaveTextContent(latest.number)
  })

  test('Shows the fragments needing revision.', () => {
    expect(container).toHaveTextContent(needsRevision.number)
  })
})
