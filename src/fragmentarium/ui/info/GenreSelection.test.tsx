import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import selectEvent from 'react-select-event'
import Promise from 'bluebird'
import GenreSelection from 'fragmentarium/ui/info/GenreSelection'
import userEvent from '@testing-library/user-event'
import { Genres } from 'fragmentarium/domain/Genres'
import SessionContext from 'auth/SessionContext'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { waitForSpinnerToBeRemoved } from '../../../test-support/waitForSpinnerToBeRemoved'

const updateGenres = jest.fn()
const fragmentService = {
  fetchGenres: jest.fn(),
}
let fragment: Fragment
let session

async function renderGenreSelection() {
  render(
    <SessionContext.Provider value={session}>
      <GenreSelection
        fragment={fragment}
        updateGenres={updateGenres}
        fragmentService={fragmentService}
      />
    </SessionContext.Provider>
  )
  await waitForSpinnerToBeRemoved(screen)
}
beforeEach(async () => {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        genres: new Genres([]),
      },
    }
  )
  fragmentService.fetchGenres.mockReturnValue(
    Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']])
  )
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  await renderGenreSelection()
})
describe('User Input', () => {
  it('Select genre & delete selected genre', async () => {
    userEvent.click(screen.getByRole('button'))
    await selectEvent.select(
      screen.getByText('Select...'),
      'ARCHIVAL ➝ Administrative'
    )

    await waitFor(() => expect(updateGenres).toHaveBeenCalledTimes(1))

    userEvent.click(screen.getByLabelText('Delete genre button'))

    expect(
      screen.queryByLabelText('ARCHIVAL ➝ Administrative')
    ).not.toBeInTheDocument()
  })
  it('click Uncertain Checkbox', async () => {
    userEvent.click(screen.getByRole('button'))

    await selectEvent.select(
      screen.getByText('Select...'),
      'ARCHIVAL ➝ Administrative'
    )

    expect(updateGenres).toHaveBeenCalled()
    userEvent.click(screen.getByRole('checkbox'))
    expect(updateGenres).toHaveBeenCalled()

    await screen.findByText('ARCHIVAL ➝ Administrative (?)')

    userEvent.click(screen.getByLabelText('Delete genre button'))

    expect(
      screen.queryByLabelText('ARCHIVAL ➝ Administrative (?)')
    ).not.toBeInTheDocument()
  })
})
