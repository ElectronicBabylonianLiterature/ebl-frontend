import React from 'react'
import FragmentLineToVecRanking from './FragmentLineToVecRanking'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Promise from 'bluebird'
import { LineToVecRanking } from 'fragmentarium/domain/lineToVecRanking'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import { scriptFactory } from 'test-support/fragment-data-fixtures'
import { Periods } from 'common/period'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext } from 'router/head'

const script = scriptFactory.build(
  {},
  { associations: { period: Periods['Neo-Assyrian'] } }
)

beforeEach(async () => {
  const session = {
    isAllowedToReadFragments: jest.fn().mockReturnValue(true),
  }
  const lineToVecRankingsResults: LineToVecRanking = {
    score: [
      { museumNumber: 'X.1', script: script, score: 10 },
      { museumNumber: 'X.2', script: script, score: 8 },
    ],
    scoreWeighted: [
      { museumNumber: 'X.1', script: script, score: 13 },
      { museumNumber: 'X.2', script: script, score: 9 },
    ],
  }
  const fragmentService = {
    lineToVecRanking: jest.fn(),
  }
  fragmentService.lineToVecRanking.mockReturnValueOnce(
    Promise.resolve(lineToVecRankingsResults)
  )
  render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter>
        <SessionContext.Provider value={(session as unknown) as Session}>
          <FragmentLineToVecRanking
            number={'X.0'}
            fragmentService={fragmentService}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>
  )
  await waitForSpinnerToBeRemoved(screen)
})

it('Shows the number of transliterated tablets', async () => {
  expect(screen.getAllByText(/X.1/)[0]).toBeVisible()
  expect(screen.getByText(/,\s*Neo-Assyrian:\s*10/)).toBeVisible()
})
