import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import _ from 'lodash'
import FragmentList, { Columns } from './FragmentList'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

const numberOfFragments = 2
const expectedStringColumns: Columns = {
  Number: 'number',
  Accession: 'accession',
  'CDLI Number': 'cdliNumber',
  Description: 'description',
}
const expectedComputedColumns: Columns = {
  Number: 'number',
  Computed: (fragment: FragmentInfo) => fragment.description.toUpperCase(),
}
let fragments: FragmentInfo[]
let element: RenderResult

describe.each([
  [
    'No config',
    null,
    {
      Number: 'number',
    },
  ],
  [
    'With string columns',
    _.omit(expectedStringColumns, ['Number']),
    expectedStringColumns,
  ],
  [
    'With computed columns',
    _.omit(expectedComputedColumns, ['Number']),
    expectedComputedColumns,
  ],
] as [string, Columns, Columns][])('%s', (name, columns, expectedColumns) => {
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

  describe.each(_.range(numberOfFragments))('Fragment %i', (index) => {
    let fragment: FragmentInfo

    beforeEach(() => {
      fragment = fragments[index]
    })

    test('Displays all properties', () => {
      const expectedRow = _.values(expectedColumns)
        .map((property) =>
          _.isFunction(property)
            ? property(fragment)
            : fragment[property as string]
        )
        .join('')
        .replace('\n', ' ')
      expect(element.container).toHaveTextContent(expectedRow)
    })

    test('Links to the fragment', () => {
      expect(element.getByText(fragment.number)).toHaveAttribute(
        'href',
        `/fragmentarium/${fragment.number}`
      )
    })
  })
})
