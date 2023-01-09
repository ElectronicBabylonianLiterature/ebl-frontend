import React from 'react'
import _ from 'lodash'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import LatestTransliterations from './LatestTransliterations'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'

const numberOfFragments = 2
const expectedColumns = {
  Number: 'number',
  Accession: 'accession',
  Script: 'script.period.abbreviation',
  Description: 'description',
}
let fragmentSearchService
let container: HTMLElement
let fragments: FragmentInfo[]

beforeEach(async () => {
  fragments = fragmentInfoFactory.buildList(numberOfFragments)
  fragmentSearchService = {
    fetchLatestTransliterations: jest.fn(),
  }
  fragmentSearchService.fetchLatestTransliterations.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  container = render(
    <MemoryRouter>
      <LatestTransliterations fragmentSearchService={fragmentSearchService} />
    </MemoryRouter>
  ).container
  await screen.findByText('Latest additions:')
})

test('Columns', () => {
  const expectedHeader = _.keys(expectedColumns).join('')
  expect(container).toHaveTextContent(expectedHeader)
})

test.each(_.range(numberOfFragments))('Fragment %i', (index) => {
  const expectedRow = _.values(expectedColumns)
    .map((property) =>
      property
        .split('.')
        .reduce((object, index) => object[index], fragments[index])
    )
    .join('')
    .replace(/\n/g, ' ')
  expect(container).toHaveTextContent(expectedRow)
})
