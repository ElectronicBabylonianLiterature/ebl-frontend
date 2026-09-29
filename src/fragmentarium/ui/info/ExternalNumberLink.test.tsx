import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  createNumberLink,
  DigitaleKeilschriftBibliothekLink,
  sealLink,
  YalePeabodyLink,
} from 'fragmentarium/ui/info/ExternalNumberLink'

it('renders the SEAL number link', () => {
  const SealLink = sealLink
  render(<SealLink number="7 000" />)

  expect(screen.getByText(/^SEAL Number \(/)).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'SEAL Number text 7 000' }),
  ).toHaveAttribute('href', 'https://seal.huji.ac.il/node/7%20000')
})

it('does not encode the Digitale Keilschrift Bibliothek number', () => {
  render(<DigitaleKeilschriftBibliothekLink number="a=1&b=2" />)

  expect(
    screen.getByRole('link', {
      name: 'Digitale Keilschrift Bibliothek text a=1&b=2',
    }),
  ).toHaveAttribute(
    'href',
    'https://gwdu64.gwdg.de/pls/tlinnemann/keilpublic_1$tafel.QueryViewByKey?a=1&b=2',
  )
})

it('formats the Yale Peabody number', () => {
  render(<YalePeabodyLink number="BC.123" />)

  expect(screen.getByRole('link', { name: /BC-123/ })).toHaveAttribute(
    'href',
    'https://collections.peabody.yale.edu/search/Record/YPM-BC-123',
  )
})

it('creates a link component with encoded numbers by default', () => {
  const ExampleLink = createNumberLink('https://example.org/', 'Example')
  render(<ExampleLink number="A/1" />)

  expect(
    screen.getByRole('link', { name: 'Example text A/1' }),
  ).toHaveAttribute('href', 'https://example.org/A%2F1')
})
