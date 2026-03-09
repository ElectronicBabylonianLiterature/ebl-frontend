import React from 'react'
import { render, screen } from '@testing-library/react'
import { Kings } from 'chronology/ui/Kings/Kings'
import ListOfKings from './BrinkmanKingsTable'

test('renders intro and table', () => {
  render(<ListOfKings />)
  expect(
    screen.getByText(/The list of kings presented here/i),
  ).toBeInTheDocument()
  expect(screen.getByRole('table')).toBeInTheDocument()
})

test('Displays only kings from Brinkman in table', () => {
  render(<ListOfKings />)
  expect(
    Kings.filter(
      (king) =>
        king.name === 'Gudea' &&
        king.dynastyName === 'Second Dynasty of Lagash',
    ).length,
  ).toBe(1)
  expect(screen.queryByText('Second Dynasty of Lagash')).not.toBeInTheDocument()
  expect(screen.queryByText('Gudea')).not.toBeInTheDocument()
})
