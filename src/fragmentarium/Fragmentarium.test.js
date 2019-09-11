import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import Fragmentarium from './Fragmentarium'

let fragmentService
let fragmentSearchService
let session
let container
let element
let statistics

async function renderFragmentarium() {
  const FragmentariumWithRouter = withRouter(Fragmentarium)
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
  await waitForElement(() => element.getByText('Current size of the corpus:'))
}

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentService = {
    statistics: jest.fn(),
    findImage: jest.fn()
  }
  fragmentSearchService = {
    fetchLatestTransliterations: jest.fn(),
    fetchNeedsRevision: jest.fn()
  }
  session = {
    isAllowedToReadFragments: jest.fn(),
    isAllowedToTransliterateFragments: jest.fn()
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  fragmentService.findImage.mockReturnValueOnce(Promise.resolve(statistics))
})

describe('Statistics', () => {
  beforeEach(async () => {
    session.isAllowedToReadFragments.mockReturnValue(false)
    session.isAllowedToTransliterateFragments.mockReturnValue(false)
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
    session.isAllowedToReadFragments.mockReturnValue(true)
    fragmentSearchService.fetchLatestTransliterations.mockReturnValueOnce(
      Promise.resolve([latest])
    )

    needsRevision = await factory.build('fragment')
    session.isAllowedToTransliterateFragments.mockReturnValue(true)
    fragmentSearchService.fetchNeedsRevision.mockReturnValueOnce(
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
