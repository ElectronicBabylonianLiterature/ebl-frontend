import React from 'react'
import { render, screen } from '@testing-library/react'
import CdliLink from 'fragmentarium/ui/info/CdliLink'

it('Links children to CDLI', () => {
  const cdliNumber = 'P0000'
  const children = 'CDLI'
  render(<CdliLink cdliNumber={cdliNumber}>{children}</CdliLink>)
  expect(screen.getByText(children)).toHaveAttribute(
    'href',
    `https://cdli.earth/${cdliNumber}`,
  )
})
