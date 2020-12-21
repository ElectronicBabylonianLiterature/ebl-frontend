import React from 'react'
import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { factory } from 'factory-girl'
import { Fragment } from 'fragmentarium/domain/fragment'
import selectEvent from 'react-select-event'
import Promise from 'bluebird'
import GenreSelection from 'fragmentarium/ui/info/GenreSelection'
import userEvent from '@testing-library/user-event'
import { Genres } from 'fragmentarium/domain/Genres'
import SessionContext from 'auth/SessionContext'

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
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
}
beforeEach(async () => {
  fragment = await factory.build('fragment', {
    genres: new Genres([]),
  })
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

    selectEvent.select(
      screen.getByText('Select...'),
      'ARCHIVAL ➝ Administrative'
    )
    await screen.findByText('ARCHIVAL ➝ Administrative')

    await waitFor(() => expect(updateGenres).toHaveBeenCalledTimes(1))

    act(() => userEvent.click(screen.getByLabelText('Delete genre button')))

    await waitForElementToBeRemoved(() =>
      screen.getByText('ARCHIVAL ➝ Administrative')
    )

    expect(
      screen.queryByLabelText('ARCHIVAL ➝ Administrative')
    ).not.toBeInTheDocument()
  })
  it('click Uncertain Checkbox', async () => {
    userEvent.click(screen.getByRole('button'))

    selectEvent.select(
      screen.getByText('Select...'),
      'ARCHIVAL ➝ Administrative'
    )
    await screen.findByText('ARCHIVAL ➝ Administrative')

    expect(updateGenres).toHaveBeenCalled()

    userEvent.click(screen.getByRole('checkbox'))
    expect(updateGenres).toHaveBeenCalled()

    await screen.findByText('ARCHIVAL ➝ Administrative (?)')

    act(() => userEvent.click(screen.getByLabelText('Delete genre button')))
    await waitForElementToBeRemoved(() =>
      screen.getByText('ARCHIVAL ➝ Administrative')
    )

    expect(
      screen.queryByLabelText('ARCHIVAL ➝ Administrative (?)')
    ).not.toBeInTheDocument()
  })
})
