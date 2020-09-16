import React from 'react'
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { factory } from 'factory-girl'
import Museum from 'fragmentarium/domain/museum'
import { Fragment } from 'fragmentarium/domain/fragment'
import selectEvent from 'react-select-event'
import userEvent from '@testing-library/user-event'
import Genre from './Genre'
import Promise from 'bluebird'

const updateGenres = jest.fn()
const fragmentService = {
  fetchGenres: jest.fn(),
}
let fragment: Fragment

function renderDetails() {
  render(
    <Genre
      fragment={fragment}
      updateGenre={updateGenress}
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
  await renderDetails()
})
describe('User Input', () => {
  it('Select genre & delete selected genre', async () => {
    userEvent.click(screen.getByRole('button'))
    await selectEvent.select(
      screen.getByLabelText('select genre'),
      'ARCHIVAL ➝ Administrative'
    )

    await waitForElementToBeRemoved(screen.getByLabelText('select genre'))

    expect(updateGenres).toHaveBeenCalledWith([['ARCHIVAL', 'Administrative']])
    await screen.findByText('ARCHIVAL ➝ Administrative')

    userEvent.click(screen.getByTestId('delete-button'))

    expect(
      screen.queryByLabelText('ARCHIVAL ➝ Administrative')
    ).not.toBeInTheDocument()
  })
  it('click Uncertain Checkbox', async () => {
    userEvent.click(screen.getByRole('button'))
    userEvent.click(screen.getByRole('checkbox'))
    await screen.findByText('UNCERTAIN')

    userEvent.click(screen.getByTestId('delete-button'))

    expect(screen.queryByLabelText('UNCERTAIN')).not.toBeInTheDocument()
  })
})
