import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import Fragmentarium from './Fragmentarium'

let fragmentService
let container
let element
let statistics

async function renderFragmentarium (path = '/fragmentarium') {
  const FragmentariumWithRouter = withRouter(Fragmentarium)
  element = render(<MemoryRouter initialEntries={[path]}>
    <FragmentariumWithRouter fragmentService={fragmentService} />
  </MemoryRouter>)
  container = element.container
  await waitForElement(() => element.getByText('Current size of the corpus:'))
}

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentService = {
    statistics: jest.fn(),
    isAllowedToRead: jest.fn(),
    isAllowedToTransliterate: () => false
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
})

describe('Statistics', () => {
  beforeEach(async () => {
    fragmentService.isAllowedToRead.mockReturnValue(false)
    await renderFragmentarium()
  })

  it('Shows the number of transliterated tablets', async () => {
    expect(container).toHaveTextContent(statistics.transliteratedFragments.toLocaleString())
  })

  it('Shows the number of transliterated lines', async () => {
    expect(container).toHaveTextContent(statistics.lines.toLocaleString())
  })
})
