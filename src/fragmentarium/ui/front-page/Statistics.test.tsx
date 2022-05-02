import React from 'react'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'
import Statistics from './Statistics'
import { statisticsFactory } from 'test-support/fragment-fixtures'

let fragmentService
let statistics

beforeEach(async () => {
  statistics = statisticsFactory.build()
  fragmentService = {
    statistics: jest.fn(),
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  render(<Statistics fragmentService={fragmentService} />)
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
})

it('Shows the number of transliterated tablets', async () => {
  expect(screen.getByText(/tablets transliterated$/)).toHaveTextContent(
    statistics.transliteratedFragments.toLocaleString()
  )
})

it('Shows the number of transliterated lines', async () => {
  expect(screen.getByText(/lines of text$/)).toHaveTextContent(
    statistics.lines.toLocaleString()
  )
})
