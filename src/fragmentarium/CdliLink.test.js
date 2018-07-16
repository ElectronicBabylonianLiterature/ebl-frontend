import React from 'react'
import {render, cleanup} from 'react-testing-library'
import CdliLink from './CdliLink'

afterEach(cleanup)

it('Links children to CDLI', () => {
  const cdliNumber = 'P0000'
  const children = 'CDLI'
  const {getByText} = render(<CdliLink cdliNumber={cdliNumber}>{children}</CdliLink>)
  expect(getByText(children))
    .toHaveAttribute('href', `https://cdli.ucla.edu/${cdliNumber}`)
})
