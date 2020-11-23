import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import Statistics from './Statistics'

let fragmentService
let statistics

beforeEach(async () => {
  statistics = await factory.build('statistics')
  const promise = Promise.resolve()
  fragmentService = {
    statistics: jest.fn(() => promise),
  }
  fragmentService.statistics.mockReturnValueOnce(Promise.resolve(statistics))
  render(<Statistics fragmentService={fragmentService} />)
  await act(() => promise)
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
