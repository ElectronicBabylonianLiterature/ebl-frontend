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

test('dynasty index links have sanitized and unique anchors', () => {
  render(<ListOfKings />)
  const nav = screen.getByRole('navigation')
  const links = within(nav).getAllByRole('link')
  const hrefs = links
    .map((link) => link.getAttribute('href'))
    .filter((href): href is string => href !== null)

  expect(new Set(hrefs).size).toBe(hrefs.length)
  hrefs.forEach((href) => {
    expect(href).toMatch(/^#dynasty-[a-z0-9]+(?:-[a-z0-9]+)*$/)
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

test('clicking dynasty index link uses non-animated scroll when reduced motion is enabled', () => {
  const originalMatchMedia = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }) as MediaQueryList,
  })

  const scrollIntoView = jest.fn()
  window.HTMLElement.prototype.scrollIntoView = scrollIntoView
  render(<ListOfKings />)

  const firstDynasty = brinkmanDynasties[0]
  const nav = screen.getByRole('navigation')
  const link = within(nav).getByText(`1. ${firstDynasty}`)
  fireEvent.click(link)

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: originalMatchMedia,
  })
})
