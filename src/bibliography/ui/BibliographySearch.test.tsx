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
let bibliographyEntries: BibliographyEntry[]
let bibliographyServiceMock

async function renderBibliographySearchComponent() {
  render(
    <MemoryRouter>
      <BibliographySearch
        query={query}
        bibliographyService={bibliographyServiceMock}
      />
    </MemoryRouter>
  )
  await waitForSpinnerToBeRemoved(screen)
}

beforeEach(async () => {
  bibliographyEntries = bibliographyEntryFactory.buildList(2)
  bibliographyServiceMock = {
    search: jest.fn(),
  }
  bibliographyServiceMock.search.mockReturnValueOnce(
    Promise.resolve(bibliographyEntries)
  )
  await renderBibliographySearchComponent()
})

test('Fetch results from bibliography service', () => {
  expect(bibliographyServiceMock.search).toHaveBeenCalledWith(query)
})

test('Display search results correctly', () => {
  bibliographyEntries.forEach((entry) => {
    const reference = createReferenceForEntry(entry)
    const citation = Citation.for(reference)

    expectCitationToBeDisplayed(citation)
    expectAuthorToBeDisplayed(entry)
  })
})

function createReferenceForEntry(entry: BibliographyEntry): Reference {
  return new Reference('DISCUSSION', '', '', [], entry)
}

function expectCitationToBeDisplayed(citation: Citation): void {
  expect(screen.getByText(citation.getMarkdown())).toBeInTheDocument()
}

function expectAuthorToBeDisplayed(entry: BibliographyEntry): void {
  const authorRegExp = createAuthorRegExp(entry)

  expect(
    screen.getByText((content, element) => {
      return (
        (element?.classList.contains('csl-entry') &&
          authorRegExp.test(content)) ||
        false
      )
    })
  ).toBeInTheDocument()
}
