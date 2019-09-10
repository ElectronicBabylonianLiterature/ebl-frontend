import React from 'react'
import _ from 'lodash'
import { render, waitForElement } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import NeedsRevision from './NeedsRevision'

const numberOfFragments = 2
const expectedColumns = {
  number: 'Number',
  accession: 'Accession',
  editor: 'Editor',
  description: 'Description'
}
let fragmentService
let container
let element
let fragments

beforeEach(async () => {
  fragments = await factory.buildMany('fragmentInfo', numberOfFragments)
  fragmentService = {
    fetchNeedsRevision: jest.fn()
  }
  fragmentService.fetchNeedsRevision.mockReturnValueOnce(
    Promise.resolve(fragments)
  )
  element = render(
    <MemoryRouter>
      <NeedsRevision fragmentService={fragmentService} />
    </MemoryRouter>
  )
  container = element.container
  await waitForElement(() => element.getByText('Needs revision:'))
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
