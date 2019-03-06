import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import Fragmentarium from './Fragmentarium'

let fragmentService
let session
let container
let element
let statistics

async function renderFragmentarium (path = '/fragmentarium') {
  const FragmentariumWithRouter = withRouter(Fragmentarium)
  element = render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <FragmentariumWithRouter fragmentService={fragmentService} />
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
    findImage: jest.fn(),
    fetchLatestTransliterations: jest.fn()
  }
  session = {
    isAllowedToReadFragments: jest.fn(),
    hasBetaAccess: jest.fn()
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  fragmentService.findImage.mockReturnValueOnce(Promise.resolve(statistics))
})

describe('Statistics', () => {
  beforeEach(async () => {
    session.isAllowedToReadFragments.mockReturnValue(false)
    session.hasBetaAccess.mockReturnValue(false)
    await renderFragmentarium()
  })

  it('Shows the number of transliterated tablets', async () => {
    expect(container).toHaveTextContent(statistics.transliteratedFragments.toLocaleString())
  })

  it('Shows the number of transliterated lines', async () => {
    expect(container).toHaveTextContent(statistics.lines.toLocaleString())
  })
})

describe('Latest additions', () => {
  let latest

  beforeEach(async () => {
    latest = await factory.build('fragment')
    session.hasBetaAccess.mockReturnValue(true)
    fragmentService.fetchLatestTransliterations.mockReturnValueOnce(Promise.resolve([latest]))
    await renderFragmentarium()
  })

  test('Shows the latest additions', () => {
    expect(container).toHaveTextContent(latest._id)
  })
})
