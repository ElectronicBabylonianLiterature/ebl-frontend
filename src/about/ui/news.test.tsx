import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutNews from './news'
import { newsletters } from './news'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent } from '@testing-library/react'

test('renders AboutNews component with default newsletter', () => {
  render(
    <MemoryRouter>
      <AboutNews />
    </MemoryRouter>,
  )
  expect(
    screen.getByText(new RegExp(`eBL Newsletter ${newsletters[0].number}`)),
  ).toBeInTheDocument()
})

test('renders AboutNews component with complete menu', () => {
  render(
    <MemoryRouter>
      <AboutNews />
    </MemoryRouter>,
  )
  newsletters.forEach((newsletter) => {
    expect(
      screen.getByText(new RegExp(`^Nr. ${newsletter.number}$`)),
    ).toBeInTheDocument()
  })
})

test('updates active newsletter on link click', () => {
  render(
    <MemoryRouter>
      <AboutNews />
    </MemoryRouter>,
  )
  const secondNewsletterLink = screen.getByText(
    new RegExp(`Nr. ${newsletters[1].number}`),
  )
  fireEvent.click(secondNewsletterLink)
  expect(
    screen.getByText(new RegExp(`eBL Newsletter ${newsletters[1].number}`)),
  ).toBeInTheDocument()
})
