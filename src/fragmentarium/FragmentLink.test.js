import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import Chance from 'chance'
import FragmentLink from './FragmentLink'

const children = 'A link'
const label = 'Link label'
const number = new Chance().string()
let element

beforeEach(() => {
  element = render(
    <MemoryRouter>
      <FragmentLink number={number} aria-label={label}>
        {children}
      </FragmentLink>
    </MemoryRouter>
  )
})

it('Links to the fragment', () => {
  expect(element.getByLabelText(label))
    .toHaveAttribute('href', `/fragmentarium/${encodeURIComponent(number)}`)
})

it('Renders children', () => {
  expect(element.container).toHaveTextContent(children)
})
