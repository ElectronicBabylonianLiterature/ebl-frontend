import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Promise from 'bluebird'
import BibliographySearch from './BibliographySearch'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import createAuthorRegExp from 'test-support/createAuthorRexExp'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Citation from 'bibliography/domain/Citation'
import Reference from 'bibliography/domain/Reference'

const query = 'Börger'
let entries: BibliographyEntry[]
let bibliographyService

async function renderBibliographySearch() {
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
  await renderBibliographySearch()
})

test('Fetch results from service', () => {
  expect(bibliographyService.search).toBeCalledWith(query)
})

test('Result display', () => {
  entries.forEach((entry) => {
    const reference = new Reference('DISCUSSION', '', '', [], entry)
    const citation = Citation.for(reference)
    expect(screen.getByText(citation.getMarkdown())).toBeInTheDocument()
    expect(
      screen.getByText((content, element) => {
        return (
          element?.classList.contains('csl-entry') &&
          createAuthorRegExp(entry).test(content)
        )
      })
    ).toBeInTheDocument()
  })
})
