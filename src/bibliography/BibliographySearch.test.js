import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import { factory } from 'factory-girl'

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

test('Result display', async () => {
  await waitForElement(() => element.getByText(new RegExp(entries[0].author)))
  expect(element.getByText(new RegExp(entries[1].author))).toBeDefined()
})
