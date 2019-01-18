import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

import Display from './Display'

let fragment
let element
let container

beforeEach(async () => {
  fragment = await factory.build('fragment', { atf: '1. ku' })
  element = render(<Display fragment={fragment} />)
  container = element.container
})

it(`Renders header`, () => {
  expect(container).toHaveTextContent(fragment.publication)
})

it('Renders transliteration', () => {
  expect(container).toHaveTextContent(fragment.atf)
})
