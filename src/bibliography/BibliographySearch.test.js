import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import { factory } from 'factory-girl'
import _ from 'lodash'

const query = 'Börger'
let entries
let bibliographyService
let element

function renderWordSearch () {
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
    search: jest.fn()
  }
  bibliographyService.search.mockReturnValueOnce(Promise.resolve(entries))
  renderWordSearch()
})

test('Fetch results from service', () => {
  expect(bibliographyService.search).toBeCalledWith(query)
})

function createAuthorRegExp (entry) {
  return new RegExp(_.escapeRegExp(entry.author))
}

test('Result display', async () => {
  await waitForElement(() => element.getByText(createAuthorRegExp(entries[0])))
  expect(element.getByText(createAuthorRegExp(entries[1]))).toBeDefined()
})
