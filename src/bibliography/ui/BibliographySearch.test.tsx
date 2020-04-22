import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import { factory } from 'factory-girl'
import _ from 'lodash'

const query = 'Börger'
let entries
let bibliographyService
let element

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

function createAuthorRegExp(entry) {
  return new RegExp(_.escapeRegExp(entry.primaryAuthor))
}

test('Result display', async () => {
  await element.findAllByText(createAuthorRegExp(entries[0]))
  expect(element.getByText(createAuthorRegExp(entries[1]))).toBeDefined()
})
