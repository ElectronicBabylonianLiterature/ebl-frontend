import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import _ from 'lodash'
import FragmentList, { Columns } from './FragmentList'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'

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
let container: HTMLElement

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
  const setup = (): void => {
    fragments = fragmentInfoFactory.buildList(numberOfFragments)
    container = render(
      <MemoryRouter>
        <FragmentList fragments={fragments} columns={columns} />
      </MemoryRouter>,
    ).container
  }

  test('Columns', () => {
    setup()
    const expectedHeader = _.keys(expectedColumns).join('')
    expect(container).toHaveTextContent(expectedHeader)
  })

  describe.each(_.range(numberOfFragments))('Fragment %i', (index) => {
    test('Displays all properties', () => {
      setup()
      const fragment: FragmentInfo = fragments[index]
      const expectedRow = _.values(expectedColumns)
        .map((property) =>
          _.isFunction(property)
            ? property(fragment)
            : fragment[property as string],
        )
        .join('')
        .replace(/\n/g, ' ')
      expect(container).toHaveTextContent(expectedRow)
    })

    test('Links to the fragment', () => {
      setup()
      const fragment: FragmentInfo = fragments[index]
      expect(screen.getByText(fragment.number)).toHaveAttribute(
        'href',
        `/library/${fragment.number}`,
      )
    })
  })
})
