import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import createAuthorRegExp from 'test-support/createAuthorRexExp'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

const query = 'Börger'
let entries: BibliographyEntry[]
let bibliographyService

async function renderWordSearch(): Promise<void> {
  render(
    <MemoryRouter>
      <BibliographySearch
        query={query}
        bibliographyService={bibliographyService}
      />
    </MemoryRouter>
  )
  await waitForSpinnerToBeRemoved(screen)
}

beforeEach(async () => {
  entries = bibliographyEntryFactory.buildList(2)
  bibliographyService = {
    search: jest.fn(),
  }
  bibliographyService.search.mockReturnValueOnce(Promise.resolve(entries))
  await renderWordSearch()
})

test('Fetch results from service', () => {
  expect(bibliographyService.search).toBeCalledWith(query)
})

test('Result display', async () => {
  expect(screen.getByText(createAuthorRegExp(entries[1]))).toBeInTheDocument()
})
