import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import { factory } from 'factory-girl'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import createAuthorRegExp from 'test-support/createAuthorRexExp'

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
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
}

beforeEach(async () => {
  entries = await factory.buildMany('bibliographyEntry', 2)
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
