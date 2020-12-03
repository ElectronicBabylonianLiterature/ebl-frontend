import React from 'react'
import FragmentLineToVecRanking from './FragmentLineToVecRanking'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'

beforeEach(async () => {
  const lineToVecRankingsResults: LineToVecRanking = {
    score: [
      ['X.1', 10],
      ['X.2', 8],
    ],
    scoreWeighted: [
      ['X.1', 13],
      ['X.2', 8],
    ],
  }
  const fragmentService = {
    lineToVecRanking: jest.fn(),
  }
  fragmentService.lineToVecRanking.mockReturnValueOnce(
    Promise.resolve(lineToVecRankingsResults)
  )
  render(
    <FragmentLineToVecRanking
      number={'X.0'}
      fragmentService={fragmentService}
    />
  )
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
})

it('Shows the number of transliterated tablets', async () => {
  expect(screen.getByText('X.1')).toBeVisible()
})
