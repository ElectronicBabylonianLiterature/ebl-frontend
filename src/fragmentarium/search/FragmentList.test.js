import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, cleanup } from 'react-testing-library'
import FragmentList from './FragmentList'
import { factory } from 'factory-girl'

let fragments
let element

afterEach(cleanup)

beforeEach(async () => {
  fragments = await factory.buildMany('fragment', 2)
  element = render(
    <MemoryRouter>
      <FragmentList data={fragments} />
    </MemoryRouter>
  )
})

it('Displays fragments', async () => {
  for (let fragment of fragments) {
    expect(element.container).toHaveTextContent(fragment._id)
    expect(element.container).toHaveTextContent(fragment.accession)
    expect(element.container).toHaveTextContent(fragment.cdliNumber)
    expect(element.container).toHaveTextContent(fragment.description)
  }
})

it('Results link to the fragment', async () => {
  for (let fragment of fragments) {
    expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
  }
})
