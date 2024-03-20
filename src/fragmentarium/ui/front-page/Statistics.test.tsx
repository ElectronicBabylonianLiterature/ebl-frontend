import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Promise from 'bluebird'
import Statistics from './Statistics'
import { statisticsFactory } from 'test-support/fragment-data-fixtures'

let fragmentService
let statistics

beforeEach(async () => {
  statistics = statisticsFactory.build()
  fragmentService = {
    statistics: jest.fn(),
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  render(<Statistics fragmentService={fragmentService} />)
  await waitForSpinnerToBeRemoved(screen)
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
