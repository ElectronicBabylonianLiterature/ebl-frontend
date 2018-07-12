import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {MemoryRouter} from 'react-router-dom'
import FragmentPager from './FragmentPager'

afterEach(cleanup)

const number = 'prefix 123456'
const child = 'K.00000'
let element

beforeEach(() => {
  element = render(<MemoryRouter><FragmentPager number={number}>{child}</FragmentPager></MemoryRouter>)
})

it('Previous links to the "previous" fragment', () => {
  expect(element.getByLabelText('Previous'))
    .toHaveAttribute('href', '/fragmentarium/prefix 123455')
})

it('Next links to the "next" fragment', () => {
  expect(element.getByLabelText('Next'))
    .toHaveAttribute('href', '/fragmentarium/prefix 123457')
})

it('Renders children', () => {
  expect(element.container).toHaveTextContent(child)
})
