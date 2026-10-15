import React from 'react'
import { render, screen } from '@testing-library/react'
import { OraccLinks, SealLinks } from 'fragmentarium/ui/info/ExternalTextLinks'

it('links Oracc projects and the Yale CCP site, separated by commas', () => {
  const { container } = render(
    <OraccLinks projects={['saao', 'ccp']} cdliNumber="P 1" />,
  )

  expect(container).toHaveTextContent('Oracc (SAAO, CCP)')
  expect(
    screen.getByRole('link', { name: 'Oracc text saao P 1' }),
  ).toHaveAttribute('href', 'http://oracc.museum.upenn.edu/saao/P%201')
  expect(
    screen.getByRole('link', { name: 'Oracc text ccp P 1' }),
  ).toHaveAttribute('href', 'https://ccp.yale.edu/P%201')
})

it('links SEAL texts, separated by commas', () => {
  const { container } = render(<SealLinks sealTextNumbers={['7', '8 a']} />)

  expect(container).toHaveTextContent('SEAL (7, 8 a)')
  expect(screen.getByRole('link', { name: 'Seal text 8 a' })).toHaveAttribute(
    'href',
    'https://seal.huji.ac.il/node/8%20a',
  )
})
