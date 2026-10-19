import React from 'react'
import { render, screen } from '@testing-library/react'
import ExternalResources from 'fragmentarium/ui/info/ExternalResources'
import { fragmentFactory } from 'test-support/fragment-fixtures'

it('lists only the resources the fragment has numbers for', () => {
  const fragment = fragmentFactory.build(
    {},
    { associations: { externalNumbers: { cdliNumber: 'P000001' } } },
  )

  render(<ExternalResources fragment={fragment} />)

  expect(screen.getAllByRole('listitem')).toHaveLength(1)
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    expect.stringContaining('P000001'),
  )
})

it('lists the Oracc projects and SEAL numbers of the fragment', () => {
  const fragment = fragmentFactory.build(
    {},
    {
      associations: {
        externalNumbers: {
          cdliNumber: 'P000001',
          oraccNumbers: ['saao/saa01'],
          sealNumbers: ['1234'],
        },
      },
    },
  )

  render(<ExternalResources fragment={fragment} />)

  expect(screen.getByText(/Oracc \(/)).toBeInTheDocument()
  expect(screen.getByText(/SEAL \(/)).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})
