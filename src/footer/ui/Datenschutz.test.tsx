import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Datenschutz from 'footer/ui/Datenschutz'

const sectionHeadings = [
  'Abruf von Netzseiten',
  'Auswertung thematischer Schwerpunkte',
  'Newsletter',
  'Social Media und externe Dienstleister',
  'Anmelde- und Kontaktformulare',
  'Weitergabe personenbezogener Daten',
  'Ihre Rechte',
  'Links',
  'Gültigkeit und Aktualität',
]

test('renders all privacy policy sections in order', () => {
  render(
    <MemoryRouter>
      <Datenschutz />
    </MemoryRouter>,
  )

  expect(
    screen
      .getAllByRole('heading', { level: 3 })
      .map(({ textContent }) => textContent),
  ).toEqual(sectionHeadings)
  expect(
    screen.getByText('Letzter Stand dieser Datenschutzerklärung: 12.12.2019'),
  ).toBeInTheDocument()
})
