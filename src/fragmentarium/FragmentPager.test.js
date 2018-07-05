import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {MemoryRouter} from 'react-router-dom'
import FragmentPager from './FragmentPager'

afterEach(cleanup)

const number = 'prefix 123456'
let getByLabelText

beforeEach(() => {
  getByLabelText = render(<MemoryRouter><FragmentPager number={number} /></MemoryRouter>).getByLabelText
})

it('Previous links to the "previous" fragment', () => {
  expect(getByLabelText('Previous'))
    .toHaveAttribute('href', '/fragmentarium/prefix 123455')
})

it('Next links to the "next" fragment', () => {
  expect(getByLabelText('Next'))
    .toHaveAttribute('href', '/fragmentarium/prefix 123457')
})
