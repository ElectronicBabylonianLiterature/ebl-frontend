import React from 'react'
import { render, screen, waitFor, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import Museum from 'fragmentarium/domain/museum'
import { Fragment } from 'fragmentarium/domain/fragment'
import selectEvent from 'react-select-event'
import Promise from 'bluebird'
import GenreSelection from 'fragmentarium/ui/info/GenreSelection'
import userEvent from '@testing-library/user-event'

const updateGenres = jest.fn()
const fragmentService = {
  fetchGenres: jest.fn(),
}
let fragment: Fragment

function renderDetails() {
  render(
    <GenreSelection
      fragment={fragment}
      updateGenres={updateGenres}
      fragmentService={fragmentService}
    />
  )
}
beforeEach(async () => {
  fragment = await factory.build('fragment', {
    museum: Museum.of('The British Museum'),
    collection: 'The Collection',
    genres: [],
  })

  fragmentService.fetchGenres.mockReturnValue(
    Promise.resolve([['ARCHIVAL'], ['ARCHIVAL', 'Administrative']])
  )
  renderDetails()
})
describe('User Input', () => {
  it('Select genre & delete selected genre', async () => {
    userEvent.click(screen.getByRole('button'))
    await selectEvent.select(
      screen.getByText('Select...'),
      'ARCHIVAL ➝ Administrative'
    )

    expect(updateGenres).toHaveBeenCalledWith([
      {
        category: ['ARCHIVAL', 'Administrative'],
        uncertain: false,
      },
    ])
    //await screen.findByText('ARCHIVAL ➝ Administrative')

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

    expect(updateGenres).toHaveBeenCalledWith([
      { category: ['ARCHIVAL', 'Administrative'], uncertain: false },
    ])
    userEvent.click(screen.getByRole('checkbox'))
    expect(updateGenres).toHaveBeenCalledWith([
      { category: ['ARCHIVAL', 'Administrative'], uncertain: true },
    ])

    await screen.findByText('ARCHIVAL ➝ Administrative (?)')

    userEvent.click(screen.getByTestId('delete-button'))

    expect(
      screen.queryByLabelText('ARCHIVAL ➝ Administrative (?)')
    ).not.toBeInTheDocument()
  })
})
