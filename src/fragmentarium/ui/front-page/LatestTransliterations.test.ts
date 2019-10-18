import React from 'react'
import _ from 'lodash'
import { render, waitForElement } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import LatestTransliterations from './LatestTransliterations'

const numberOfFragments = 2
const expectedColumns = {
  number: 'Number',
  accession: 'Accession',
  script: 'Script',
  description: 'Description'
}
let fragmentSearchService
let container
let element
let fragments

beforeEach(async () => {
  fragments = await factory.buildMany('fragment', numberOfFragments)
  fragmentSearchService = {
    fetchLatestTransliterations: jest.fn()
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
  await waitForElement(() => element.getByText('Latest additions:'))
})

test('Columns', () => {
  const expectedHeader = _.values(expectedColumns).join('')
  expect(container).toHaveTextContent(expectedHeader)
})

test.each(_.range(numberOfFragments))('Fragment %i', index => {
  const expectedRow = _.keys(expectedColumns)
    .map(property => fragments[index][property])
    .join('')
    .replace('\n', ' ')
  expect(container).toHaveTextContent(expectedRow)
})
