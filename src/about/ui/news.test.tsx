import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutNews from './news'
import { newsletters } from './news'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { fireEvent } from '@testing-library/react'

test('renders AboutNews component with default newsletter', () => {
  const history = createMemoryHistory()
  render(
    <Router history={history}>
      <AboutNews />
    </Router>
  )
  expect(
    screen.getByText(new RegExp(`eBL Newsletter ${newsletters[0].number}`))
  ).toBeInTheDocument()
})

test('renders AboutNews component with complete menu', () => {
  const history = createMemoryHistory()
  render(
    <Router history={history}>
      <AboutNews />
    </Router>
  )
  newsletters.forEach((newsletter) => {
    expect(
      screen.getByText(new RegExp(`^Nr. ${newsletter.number}$`))
    ).toBeInTheDocument()
  })
})

test('updates active newsletter on link click', () => {
  const history = createMemoryHistory()
  render(
    <Router history={history}>
      <AboutNews />
    </Router>
  )
  const secondNewsletterLink = screen.getByText(
    new RegExp(`Nr. ${newsletters[1].number}`)
  )
  fireEvent.click(secondNewsletterLink)
  expect(history.location.pathname).toBe(`/about/news/${newsletters[1].number}`)
  expect(
    screen.getByText(new RegExp(`eBL Newsletter ${newsletters[1].number}`))
  ).toBeInTheDocument()
})
