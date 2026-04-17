import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Kings, brinkmanDynasties } from 'chronology/ui/Kings/Kings'
import ListOfKings from './BrinkmanKingsTable'

test('renders intro and table', () => {
  render(<ListOfKings />)
  expect(
    screen.getByText(/The list of kings presented here/i),
  ).toBeInTheDocument()
  expect(screen.getByRole('table')).toBeInTheDocument()
})

test('Snapshot', () => {
  expect(render(<ListOfKings />).container).toMatchSnapshot()
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

test('renders dynasty index navigation', () => {
  render(<ListOfKings />)
  const nav = screen.getByRole('navigation')
  expect(nav).toBeInTheDocument()
  const links = within(nav).getAllByRole('link')
  expect(links).toHaveLength(brinkmanDynasties.length)
})

test('dynasty index links contain dynasty names', () => {
  render(<ListOfKings />)
  const nav = screen.getByRole('navigation')
  brinkmanDynasties.forEach((dynastyName, index) => {
    expect(
      within(nav).getByText(`${index + 1}. ${dynastyName}`),
    ).toBeInTheDocument()
  })
})

test('clicking dynasty index link scrolls to dynasty', () => {
  const scrollIntoView = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = scrollIntoView
  render(<ListOfKings />)

  const firstDynasty = brinkmanDynasties[0]
  const nav = screen.getByRole('navigation')
  const link = within(nav).getByText(`1. ${firstDynasty}`)
  fireEvent.click(link)

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
})
