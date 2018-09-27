import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import Statistics from './Statistics'

let fragmentRepository
let element
let statistics

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentRepository = {
    statistics: jest.fn()
  }
  fragmentRepository.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  element = render(<Statistics fragmentRepository={fragmentRepository} />)
})

it('Shows the number of transliterated tablets', async () => {
  const { textContent } = await waitForElement(() => element.getByText(/tablets transliterated$/))
  expect(textContent).toContain(statistics.transliteratedFragments.toLocaleString())
})

it('Shows the number of transliterated lines', async () => {
  const { textContent } = await waitForElement(() => element.getByText(/lines of text$/))
  expect(textContent).toContain(statistics.lines.toLocaleString())
})
