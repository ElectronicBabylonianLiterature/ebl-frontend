import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import { factory } from 'factory-girl'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import createAuthorRegExp from 'test-support/createAuthorRexExp'

const query = 'Börger'
let entries: BibliographyEntry[]
let bibliographyService

function renderWordSearch(): void {
  render(
    <MemoryRouter>
      <BibliographySearch
        query={query}
        bibliographyService={bibliographyService}
      />
    </MemoryRouter>
  )
}

beforeEach(async () => {
  entries = await factory.buildMany('bibliographyEntry', 2)
  const promise = Promise.resolve(entries)
  bibliographyService = {
    search: jest.fn(() => promise),
  }
  bibliographyService.search.mockReturnValueOnce(Promise.resolve(entries))
  renderWordSearch()
  await screen.findAllByText(createAuthorRegExp(entries[0]))
})

test('Fetch results from service', () => {
  expect(bibliographyService.search).toBeCalledWith(query)
})

test('Result display', async () => {
  expect(screen.getByText(createAuthorRegExp(entries[1]))).toBeDefined()
})
