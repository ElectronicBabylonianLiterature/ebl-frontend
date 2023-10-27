import React from 'react'
import { render, screen } from '@testing-library/react'
import ExternalResources from './ExternalResources'

import Museum from 'fragmentarium/domain/museum'
import {
  externalNumbersFactory,
  fragmentFactory,
} from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

const cdliNumber = 'P 0000+q'
const bmIdNumber = 'bm 00000+q'
let fragment: Fragment

beforeEach(async () => {
  fragment = fragmentFactory.build(
    {},
    {
      associations: {
        externalNumbers: externalNumbersFactory.build({
          cdliNumber,
          bmIdNumber,
        }),
      },
    }
  )
  render(<ExternalResources fragment={fragment} />)
})

it('Links to CDLI text', () => {
  expect(screen.getByLabelText(`CDLI text ${cdliNumber}`)).toHaveAttribute(
    'href',
    `https://cdli.mpiwg-berlin.mpg.de/${encodeURIComponent(cdliNumber)}`
  )
})

it('Renders The British Museum logo', () => {
  expect(screen.getByAltText('The British Museum')).toHaveAttribute(
    'src',
    Museum.of('The British Museum').logo
  )
})

it('Links to The British Museum object', () => {
  expect(
    screen.getByLabelText(`The British Museum object ${bmIdNumber}`)
  ).toHaveAttribute(
    'href',
    Museum.of('The British Museum').createLinkFor(fragment).url
  )
})
