import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { Fragment } from 'fragmentarium/domain/fragment'
import selectEvent from 'react-select-event'
import Promise from 'bluebird'
import GenreSelection from 'fragmentarium/ui/info/GenreEditor'
import userEvent from '@testing-library/user-event'
import { Genres } from 'fragmentarium/domain/Genres'
import SessionContext from 'auth/SessionContext'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { waitForSpinnerToBeRemoved } from '../../../test-support/waitForSpinnerToBeRemoved'
import FragmentService from 'fragmentarium/application/FragmentService'

jest.mock('fragmentarium/application/FragmentService')

const updateGenres = jest.fn()
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const mockGenres = [['ARCHIVAL'], ['CANONICAL'], ['ARCHIVAL', 'Administrative']]
const fragmentServiceMock = new MockFragmentService()

let fragment: Fragment
let session

async function renderGenreSelection() {
  render(
    <SessionContext.Provider value={session}>
      <Router>
        <GenreSelection
          fragment={fragment}
          updateGenres={updateGenres}
          fragmentService={fragmentServiceMock}
        />
      </Router>
    </SessionContext.Provider>,
  )
  await waitForSpinnerToBeRemoved(screen)
}
async function setup(): Promise<void> {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        genres: new Genres([]),
      },
    },
  )
  fragmentServiceMock.fetchGenres.mockReturnValue(Promise.resolve(mockGenres))
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  session.isAllowedToTransliterateFragments.mockReturnValue(true)
  await renderGenreSelection()
  await userEvent.click(screen.getByLabelText('edit-genre'))
}
describe('Genre Editor', () => {
  it('shows the editor when the user clicks the edit button', async () => {
    await setup()
    expect(screen).toMatchSnapshot()
  })
  it('shows the available options when clicking Select...', async () => {
    await setup()
    await userEvent.click(screen.getByLabelText('select-genre'))
    expect(fragmentServiceMock.fetchGenres).toHaveBeenCalled()
    mockGenres.forEach((genre) => {
      expect(screen.getByText(genre.join(' ➝ '))).toBeVisible()
    })
  })
  it('updates the genre when the user selects an option', async () => {
    await setup()
    await selectEvent.select(
      screen.getByLabelText('select-genre'),
      'ARCHIVAL ➝ Administrative',
    )
    await userEvent.click(screen.getByLabelText('add-genre'))
    await waitFor(() => expect(updateGenres).toHaveBeenCalled())
    expect(screen.getByText('ARCHIVAL ➝ Administrative')).toBeVisible()
  })
  it('sets uncertain=true', async () => {
    await setup()
    await userEvent.click(screen.getByLabelText('toggle-uncertain'))
    await selectEvent.select(
      screen.getByLabelText('select-genre'),
      'CANONICAL (?)',
    )
    await userEvent.click(screen.getByLabelText('add-genre'))
    await waitFor(() => expect(updateGenres).toHaveBeenCalled())
    expect(screen.getByText('CANONICAL (?)')).toBeVisible()
  })
  it('deletes the genre when the user clicks the delete button', async () => {
    await setup()
    await selectEvent.select(screen.getByLabelText('select-genre'), 'ARCHIVAL')
    await userEvent.click(screen.getByLabelText('add-genre'))
    await waitFor(() => expect(updateGenres).toHaveBeenCalled())

    await userEvent.click(screen.getByLabelText('delete-genre'))
    await waitFor(() => expect(updateGenres).toHaveBeenCalled())
    expect(screen.queryByText('ARCHIVAL')).not.toBeInTheDocument()
  })
})
