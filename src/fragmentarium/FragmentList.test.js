import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import _ from 'lodash'
import FragmentList from './FragmentList'

const numberOfFragments = 2
const expectedStringColumns = {
  'Number': '_id',
  'Accession': 'accession',
  'CDLI Number': 'cdliNumber',
  'Description': 'description'
}
const expectedComputedColumns = {
  'Number': '_id',
  'Computed': fragment => fragment.description.toUpperCase()
}
let fragments
let element

describe.each([
  ['No config', null, {
    'Number': '_id'
  }],
  ['With strig columns', _.omit(expectedStringColumns, ['Number']), expectedStringColumns],
  ['With computed columns', _.omit(expectedComputedColumns, ['Number']), expectedComputedColumns]
])('%s', (name, columns, expectedColumns) => {
  beforeEach(async () => {
    fragments = await factory.buildMany('fragment', numberOfFragments)
    element = render(
      <MemoryRouter>
        <FragmentList fragments={fragments} columns={columns} />
      </MemoryRouter>
    )
  })

  test('Columns', () => {
    const expectedHeader = _.keys(expectedColumns).join('')
    expect(element.container).toHaveTextContent(expectedHeader)
  })

  describe.each(_.range(numberOfFragments))('Fragment %i', index => {
    let fragment

    beforeEach(() => {
      fragment = fragments[index]
    })

    test('Displays all properties', () => {
      const expectedRow = _.values(expectedColumns).map(property => _.isFunction(property)
        ? property(fragment)
        : fragment[property]
      ).join('').replace('\n', ' ')
      expect(element.container).toHaveTextContent(expectedRow)
    })

    test('Links to the fragment', () => {
      expect(element.getByText(fragment._id)).toHaveAttribute('href', `/fragmentarium/${fragment._id}`)
    })
  })
})
