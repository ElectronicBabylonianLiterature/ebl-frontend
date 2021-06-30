import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import OrganizationLinks from './OrganizationLinks'

import cdliLogo from './cdli.png'
import Museum from 'fragmentarium/domain/museum'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

const cdliNumber = 'P 0000+q'
const bmIdNumber = 'bm 00000+q'
let fragment: Fragment
let element: RenderResult

beforeEach(async () => {
  fragment = fragmentFactory.build({ cdliNumber, bmIdNumber })
  element = render(<OrganizationLinks fragment={fragment} />)
})

it('Renders CDLI logo', () => {
  expect(element.getByAltText('cdli')).toHaveAttribute('src', cdliLogo)
})

it('Links to CDLI text', () => {
  expect(element.getByLabelText(`CDLI text ${cdliNumber}`)).toHaveAttribute(
    'href',
    `https://cdli.ucla.edu/${encodeURIComponent(cdliNumber)}`
  )
})

it('Renders The British Museum logo', () => {
  expect(element.getByAltText('The British Museum')).toHaveAttribute(
    'src',
    Museum.of('The British Museum').logo
  )
})

it('Links to The British Museum object', () => {
  expect(
    element.getByLabelText(`The British Museum object ${bmIdNumber}`)
  ).toHaveAttribute(
    'href',
    Museum.of('The British Museum').createLinkFor(fragment).url
  )
})
