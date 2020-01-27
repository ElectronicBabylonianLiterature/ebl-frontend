import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Fragment } from 'fragmentarium/domain/fragment'

import Display from './Display'

let fragment: Fragment
let element: RenderResult
let container: HTMLElement

beforeEach(async () => {
  fragment = await factory.build('fragment', {
    atf: '1. ku',
    publication: 'Guod cigipli epibif odepuwu.',
    description:
      'Balbodduh lifuseb wuuk nasu hulwajo ho hiskuk riwa eldat ivu jandara nosrina abike befukiz ravsus.\nZut uzzejum ub mil ika roppar zewize ipifac vut eci avimez cewmikjov kiwso zamli jecja now.'
  })
  element = render(<Display fragment={fragment} />)
  container = element.container
})

test(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

test('Renders transliteration', () => {
  expect(container).toHaveTextContent(fragment.atf)
})

test('Snapshot', () => {
  expect(container).toMatchSnapshot()
})
