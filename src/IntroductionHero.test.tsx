import React from 'react'
import { render, screen } from '@testing-library/react'
import Hero from 'IntroductionHero'

test('renders the hero title and supporter logos', () => {
  render(<Hero />)

  expect(
    screen.getByRole('heading', { name: 'Electronic Babylonian Library' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Leibniz-Rechenzentrum' }),
  ).toHaveAttribute('href', 'https://www.lrz.de/index.html')
  expect(
    screen.getByRole('link', { name: 'Alexander von Humboldt Stiftung' }),
  ).toHaveAttribute('href', 'https://www.humboldt-foundation.de/')
  expect(
    screen.getByRole('link', { name: 'European Research Council' }),
  ).toHaveAttribute('href', 'https://erc.europa.eu/homepage')
})
