import { render, screen } from '@testing-library/react'
import BrinkmanKingsTable from 'chronology/ui/BrinkmanKings/BrinkmanKings'

/*
jest.doMock('chronology/domain/BrinkmanKings.json', () => ({
  __esModule: true,
  default: [],
}))
*/
jest.mock('chronology/domain/BrinkmanKings.json', () => [], { virtual: true })

test('Snapshot', () => {
  expect(BrinkmanKingsTable()).toMatchSnapshot()
})

test('Displays only kings from Brinkman in table', () => {
  render(BrinkmanKingsTable())
  expect(screen.getByText('Maništušu')).not.toBeInTheDocument()
})
