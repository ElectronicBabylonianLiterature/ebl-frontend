import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { factory } from 'factory-girl'
import Museum from 'fragmentarium/domain/museum'
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

function renderGenreSelection() {
  render(
    <SessionContext.Provider value={session}>
      <GenreSelection
        fragment={fragment}
        updateGenres={updateGenres}
        fragmentService={fragmentService}
      />
    </SessionContext.Provider>
  )
}

beforeEach(async () => {
  fragment = await factory.build('fragment', {
    museum: Museum.of('The British Museum'),
    collection: 'The Collection',
    genres: new Genres([]),
  })
  fragmentService.fetchGenres.mockReturnValue(
    Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']])
  )
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  renderGenreSelection()
})

describe('User Input', () => {
  it('Select genre & delete selected genre', async () => {
    userEvent.click(screen.getByRole('button'))
    await selectEvent.select(
      screen.getByText('Select...'),
      'ARCHIVAL ➝ Administrative'
    )

    await waitFor(() => expect(updateGenres).toHaveBeenCalledTimes(1))

    userEvent.click(screen.getByTestId('delete-button'))

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

    userEvent.click(screen.getByTestId('delete-button'))

    expect(
      screen.queryByLabelText('ARCHIVAL ➝ Administrative (?)')
    ).not.toBeInTheDocument()
  })
})
