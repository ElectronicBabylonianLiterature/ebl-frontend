import React from 'react'
import FragmentLineToVecRanking from './FragmentLineToVecRanking'
import { MemoryRouter } from 'react-router-dom'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
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
    <MemoryRouter>
      <SessionContext.Provider value={(session as unknown) as Session}>
        <FragmentLineToVecRanking
          number={'X.0'}
          fragmentService={fragmentService}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
})

it('Shows the number of transliterated tablets', async () => {
  expect(screen.getByText('X.1:10')).toBeVisible()
})
