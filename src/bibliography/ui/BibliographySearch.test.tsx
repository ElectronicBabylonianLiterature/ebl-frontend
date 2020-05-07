import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderResult } from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import { factory } from 'factory-girl'
import _ from 'lodash'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

const query = 'Börger'
let entries: BibliographyEntry[]
let bibliographyService
let element: RenderResult

function renderWordSearch(): void {
  element = render(
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
  bibliographyService = {
    search: jest.fn(),
  }
  bibliographyService.search.mockReturnValueOnce(Promise.resolve(entries))
  renderWordSearch()
})

test('Fetch results from service', () => {
  expect(bibliographyService.search).toBeCalledWith(query)
})

function createAuthorRegExp(entry: BibliographyEntry): RegExp {
  return new RegExp(_.escapeRegExp(entry.primaryAuthor.replace("'", '’')))
}

test('Result display', async () => {
  await element.findAllByText(createAuthorRegExp(entries[0]))
  expect(element.getByText(createAuthorRegExp(entries[1]))).toBeDefined()
})
