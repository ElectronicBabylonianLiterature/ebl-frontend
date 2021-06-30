import React from 'react'
import _ from 'lodash'
import { render, RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import LatestTransliterations from './LatestTransliterations'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'

const numberOfFragments = 2
const expectedColumns = {
  number: 'Number',
  accession: 'Accession',
  script: 'Script',
  description: 'Description',
}
let fragmentSearchService
let container: HTMLElement
let element: RenderResult
let fragments: FragmentInfo[]

beforeEach(async () => {
  fragments = fragmentInfoFactory.buildList(numberOfFragments)
  fragmentSearchService = {
    fetchLatestTransliterations: jest.fn(),
  }
  fragmentSearchService.fetchLatestTransliterations.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  element = render(
    <MemoryRouter>
      <LatestTransliterations fragmentSearchService={fragmentSearchService} />
    </MemoryRouter>
  )
  container = element.container
  await element.findByText('Latest additions:')
})

test('Columns', () => {
  const expectedHeader = _.values(expectedColumns).join('')
  expect(container).toHaveTextContent(expectedHeader)
})

test.each(_.range(numberOfFragments))('Fragment %i', (index) => {
  const expectedRow = _.keys(expectedColumns)
    .map((property) => fragments[index][property])
    .join('')
    .replace(/\n/g, ' ')
  expect(container).toHaveTextContent(expectedRow)
})
