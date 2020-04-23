import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import Statistics from './Statistics'

let fragmentService
let element
let statistics

beforeEach(async () => {
  statistics = await factory.build('statistics')
  fragmentService = {
    statistics: jest.fn()
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  element = render(<Statistics fragmentService={fragmentService} />)
})

it('Shows the number of transliterated tablets', async () => {
  const { textContent } = await element.findByText(/tablets transliterated$/)
  expect(textContent).toContain(
    statistics.transliteratedFragments.toLocaleString()
  )
})

it('Shows the number of transliterated lines', async () => {
  const { textContent } = await element.findByText(/lines of text$/)
  expect(textContent).toContain(statistics.lines.toLocaleString())
})
