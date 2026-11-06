import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SearchForm } from 'fragmentarium/ui/SearchForm'
import { searchFormProps } from 'fragmentarium/ui/SearchForm.props.testSupport'

it('keeps an invalid findspot constraint visible and blocks search until explicitly cleared', async () => {
  const navigate = jest.fn()
  render(
    <MemoryRouter>
      <SearchForm
        {...searchFormProps({
          navigate,
          fragmentQuery: { findspotId: '7x', site: 'Uruk' },
        })}
      />
    </MemoryRouter>,
  )
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Findspot ID 7x is invalid.',
  )
  const number = screen.getByRole('textbox', { name: 'Number' })
  expect(number).not.toHaveClass('is-invalid')
  await userEvent.type(number, 'K 1')
  expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
  expect(navigate).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole('button', { name: 'Clear findspot filter' }),
  )
  expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled()
  const query = new URLSearchParams(navigate.mock.calls[0][0].search)
  expect(query.get('findspotId')).toBeNull()
  expect(query.get('site')).toBe('Uruk')
  expect(query.get('number')).toBe('K 1')
})
