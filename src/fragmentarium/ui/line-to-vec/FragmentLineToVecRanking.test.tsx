import React from 'react'
import FragmentLineToVecRanking from './FragmentLineToVecRanking'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Promise from 'bluebird'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'

beforeEach(async () => {
  const session = {
    isAllowedToReadFragments: jest.fn().mockReturnValue(true),
  }
  const lineToVecRankingsResults: LineToVecRanking = {
    score: [
      { museumNumber: 'X.1', legacyScript: 'NA', score: 10 },
      { museumNumber: 'X.2', legacyScript: 'NA', score: 8 },
    ],
    scoreWeighted: [
      { museumNumber: 'X.1', legacyScript: 'NA', score: 13 },
      { museumNumber: 'X.2', legacyScript: 'NA', score: 9 },
    ],
  }
  const fragmentService = {
    lineToVecRanking: jest.fn(),
  }
  fragmentService.lineToVecRanking.mockReturnValueOnce(
    Promise.resolve(lineToVecRankingsResults)
  )
  render(
    <MemoryRouter>
      <SessionContext.Provider value={(session as unknown) as Session}>
        <FragmentLineToVecRanking
          number={'X.0'}
          fragmentService={fragmentService}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await waitForSpinnerToBeRemoved(screen)
})

it('Shows the number of transliterated tablets', async () => {
  expect(screen.getAllByText(/X.1/)[0]).toBeVisible()
  expect(screen.getByText(/,\s*NA:\s*10/)).toBeVisible()
})
