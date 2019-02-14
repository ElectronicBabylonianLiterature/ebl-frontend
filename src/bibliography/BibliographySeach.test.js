import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, waitForElement } from 'react-testing-library'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import { factory } from 'factory-girl'

const query = 'Börger'
let entries
let fragmentService
let element

function renderWordSearch () {
  element = render(<MemoryRouter>
    <BibliographySearch query={query} fragmentService={fragmentService} />
  </MemoryRouter>)
}

beforeEach(async () => {
  entries = await factory.buildMany('bibliographyEntry', 2)
  fragmentService = {
    searchBibliography: jest.fn()
  }
  fragmentService.searchBibliography.mockReturnValueOnce(Promise.resolve(entries))
  renderWordSearch()
})

test('Fetch results from service', () => {
  expect(fragmentService.searchBibliography).toBeCalledWith(query)
})

test('Result display', async () => {
  await waitForElement(() => element.getByText(new RegExp(entries[0].author)))
  expect(element.getByText(new RegExp(entries[1].author))).toBeDefined()
})
