import React from 'react'
import _ from 'lodash'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import NeedsRevision from './NeedsRevision'
import { FragmentInfo } from 'fragmentarium/domain/fragment'
import { fragmentInfoFactory } from 'test-support/fragment-fixtures'

const numberOfFragments = 2
const expectedColumns = {
  number: 'Number',
  accession: 'Accession',
  editor: 'Editor',
  description: 'Description',
}
let fragmentSearchService
let container: HTMLElement
let fragments: FragmentInfo[]

const setup = async (): Promise<void> => {
  fragments = fragmentInfoFactory.buildList(numberOfFragments)
  fragmentSearchService = {
    fetchNeedsRevision: jest.fn(),
  }
  fragmentSearchService.fetchNeedsRevision.mockReturnValueOnce(
    Promise.resolve(fragments),
  )
  container = render(
    <MemoryRouter>
      <NeedsRevision fragmentSearchService={fragmentSearchService} />
    </MemoryRouter>,
  ).container
  await screen.findByText('Needs revision:')
}

test('Columns', async () => {
  await setup()
  const expectedHeader = _.values(expectedColumns).join('')
  expect(container).toHaveTextContent(expectedHeader)
})

test.each(_.range(numberOfFragments))('Fragment %i', async (index) => {
  await setup()
  const expectedRow = _.keys(expectedColumns)
    .map((property) => fragments[index][property])
    .join('')
    .replace(/\n/g, ' ')
  expect(container).toHaveTextContent(expectedRow)
})
