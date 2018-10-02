import React from 'react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import { render, wait, waitForElement } from 'react-testing-library'
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
  await wait()
}

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentService = {
    statistics: jest.fn(),
    searchNumber: jest.fn(),
    searchTransliteration: jest.fn(),
    isAllowedToRead: jest.fn(),
    isAllowedToTransliterate: () => false
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
})

describe('Search', () => {
  let fragments

  beforeEach(async () => {
    fragmentService.isAllowedToRead.mockReturnValue(true)
  })

  describe('Searching fragments by number', () => {
    let number = 'K.2'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragment', 2)
      fragmentService.searchNumber.mockReturnValueOnce(Promise.resolve(fragments))
      renderFragmentarium(`/fragmentarium?number=${number}`)
    })

    it('Displays result on successfull query', async () => {
      await waitForElement(() => element.getByText(fragments[0]._id))
      expect(container).toHaveTextContent(fragments[1]._id)
    })

    it('Fills in search form query', () => {
      expect(element.getByLabelText('Number').value).toEqual(number)
    })
  })

  describe('Searching fragments by transliteration', () => {
    let transliteration = 'pak'

    beforeEach(async () => {
      fragments = await factory.buildMany('fragment', 2, [
        { matching_lines: [['line 1', 'line 2']] },
        { matching_lines: [['line 3'], ['line 4']] }
      ])
      fragmentService.searchTransliteration.mockReturnValueOnce(Promise.resolve(fragments))
      renderFragmentarium(`/fragmentarium?transliteration=${transliteration}`)
    })

    it('Displays result on successfull query', async () => {
      await waitForElement(() => element.getByText(fragments[0]._id))
      expect(container).toHaveTextContent(fragments[1]._id)
    })

    it('Fills in search form query', () => {
      expect(element.getByLabelText('Transliteration').value).toEqual(transliteration)
    })
  })
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
