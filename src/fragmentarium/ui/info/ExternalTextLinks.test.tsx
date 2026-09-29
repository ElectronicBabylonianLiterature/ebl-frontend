import React from 'react'
import { render, screen } from '@testing-library/react'
import { OraccLinks, SealLinks } from 'fragmentarium/ui/info/ExternalTextLinks'

it('renders comma separated Oracc project links', () => {
  const { container } = render(
    <OraccLinks projects={['ccp', 'dcclt']} cdliNumber="P 1" />,
  )

  expect(container).toHaveTextContent('Oracc (CCP, DCCLT)')
  expect(
    screen.getByRole('link', { name: 'Oracc text ccp P 1' }),
  ).toHaveAttribute('href', 'https://ccp.yale.edu/P%201')
  expect(
    screen.getByRole('link', { name: 'Oracc text dcclt P 1' }),
  ).toHaveAttribute('href', 'http://oracc.museum.upenn.edu/dcclt/P%201')
})

it('renders comma separated SEAL links', () => {
  const { container } = render(<SealLinks sealTextNumbers={['1', '2 a']} />)

  expect(container).toHaveTextContent('SEAL (1, 2 a)')
  expect(screen.getByRole('link', { name: 'Seal text 2 a' })).toHaveAttribute(
    'href',
    'https://seal.huji.ac.il/node/2%20a',
  )
})
