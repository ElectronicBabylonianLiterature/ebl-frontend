import React from 'react'
import { render } from '@testing-library/react'
import CdliLink from './CdliLink'

it('Links children to CDLI', () => {
  const cdliNumber = 'P0000'
  const children = 'CDLI'
  const { getByText } = render(
    <CdliLink cdliNumber={cdliNumber}>{children}</CdliLink>
  )
  expect(getByText(children)).toHaveAttribute(
    'href',
    `https://cdli.ucla.edu/${cdliNumber}`
  )
})
