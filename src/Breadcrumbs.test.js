import React from 'react'
import { render, cleanup } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from './Breadcrumbs'

afterEach(cleanup)

let element

beforeEach(() => {
  element = render(<MemoryRouter><Breadcrumbs section='Dictionary' active='Active' /></MemoryRouter>)
})

it('Links to home', async () => {
  expect(element.getByText('eBL'))
    .toHaveAttribute('href', `/`)
})

it('Links to the section', async () => {
  expect(element.getByText('Dictionary'))
    .toHaveAttribute('href', `/dictionary`)
})

it('Displays active', async () => {
  expect(element.container).toHaveTextContent('Active')
})
