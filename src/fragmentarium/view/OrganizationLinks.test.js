import React from 'react'
import { render } from 'react-testing-library'
import OrganizationLinks from './OrganizationLinks'

import cdliLogo from './cdli.png'
import bmLogo from './The_British_Museum.png'

const cdliNumber = 'P0000'
const bmIdNumber = '00000'
let element

beforeEach(() => {
  element = render(
    <OrganizationLinks cdliNumber={cdliNumber} bmIdNumber={bmIdNumber} />
  )
})

it('Renders CDLI logo', () => {
  expect(element.getByAltText('cdli')).toHaveAttribute('src', cdliLogo)
})

it('Links to CDLI text', () => {
  expect(element.getByLabelText(`CDLI text ${cdliNumber}`)).toHaveAttribute(
    'href',
    `https://cdli.ucla.edu/${cdliNumber}`
  )
})

it('Renders The British Museum logo', () => {
  expect(element.getByAltText('The British Museum')).toHaveAttribute(
    'src',
    bmLogo
  )
})

it('Links to The British Museum obhect', () => {
  expect(
    element.getByLabelText(`The British Museum object ${bmIdNumber}`)
  ).toHaveAttribute(
    'href',
    `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${bmIdNumber}&partId=1`
  )
})
