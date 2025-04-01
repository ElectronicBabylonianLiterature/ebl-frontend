import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Promise from 'bluebird'
import Statistics from './Statistics'
import { statisticsFactory } from 'test-support/fragment-data-fixtures'

interface ExtendedStatistics {
  transliteratedFragments: number
  lines: number
  totalFragments: number
}

let fragmentService: { statistics: jest.Mock }
let statistics: ExtendedStatistics

beforeEach(async () => {
  statistics = statisticsFactory.build({
    transliteratedFragments: 1234,
    lines: 5678,
    totalFragments: 9012,
  }) as ExtendedStatistics
  fragmentService = {
    statistics: jest.fn(),
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  render(<Statistics fragmentService={fragmentService} />)
  await waitForSpinnerToBeRemoved(screen)
})

it('Shows the number of tablets indexed', async () => {
  expect(screen.getByText(/tablets indexed$/)).toHaveTextContent(
    statistics.totalFragments.toLocaleString()
  )
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
