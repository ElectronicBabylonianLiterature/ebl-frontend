import React from 'react'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Statistics from './Statistics'
import { statisticsFactory } from 'test-support/fragment-data-fixtures'
import FragmentService, {
  FragmentStatistics,
} from 'fragmentarium/application/FragmentService'

let fragmentService: { statistics: jest.Mock }
let statistics: FragmentStatistics

const setup = async (): Promise<void> => {
  statistics = statisticsFactory.build({
    transliteratedFragments: 1234,
    lines: 5678,
    totalFragments: 9012,
  }) as FragmentStatistics
  fragmentService = {
    statistics: jest.fn(),
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  render(
    <Statistics
      fragmentService={fragmentService as unknown as FragmentService}
    />,
  )
  await waitForSpinnerToBeRemoved(screen)
}

it('Shows the number of tablets indexed', async () => {
  await setup()
  expect(screen.getByText(/tablets indexed$/)).toBeInTheDocument()
  expect(
    screen.getByText(statistics.totalFragments.toLocaleString()),
  ).toBeInTheDocument()
})

it('Shows the number of transliterated tablets', async () => {
  await setup()
  expect(screen.getByText(/tablets transliterated$/)).toBeInTheDocument()
  expect(
    screen.getByText(statistics.transliteratedFragments.toLocaleString()),
  ).toBeInTheDocument()
})

it('Shows the number of transliterated lines', async () => {
  await setup()
  expect(screen.getByText(/lines of text$/)).toBeInTheDocument()
  expect(
    screen.getByText(statistics.lines.toLocaleString()),
  ).toBeInTheDocument()
})
