import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import _ from 'lodash'
import FragmentList from './FragmentList'

const numberOfFragments = 2
const expectedColumns = {
  _id: 'Number',
  accession: 'Accession',
  cdliNumber: 'CDLI Number',
  description: 'Description'
}
let fragments
let element

beforeEach(async () => {
  fragments = await factory.buildMany('fragment', numberOfFragments)
  element = render(
    <MemoryRouter>
      <FragmentList fragments={fragments} />
    </MemoryRouter>
  )
})

test('Columns', () => {
  const expectedHeader = _.values(expectedColumns).join('')
  expect(element.container).toHaveTextContent(expectedHeader)
})

describe.each(_.range(numberOfFragments))('Fragment %i', index => {
  let fragment

  beforeEach(() => {
    fragment = fragments[index]
  })

  test('Displays all properties', () => {
    const expectedRow = _.keys(expectedColumns).map(property => fragment[property]).join('').replace('\n', ' ')
    expect(element.container).toHaveTextContent(expectedRow)
  })

  test('Links to the fragment', () => {
    expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
  })
})
