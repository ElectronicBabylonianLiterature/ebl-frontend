import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, within } from '@testing-library/react'
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

async function renderBibliographySearchComponent(
  path = '/bibliography/references',
) {
  bibliographyEntries = bibliographyEntryFactory.buildList(2)
  bibliographyServiceMock = {
    search: jest.fn(),
  }
  bibliographyServiceMock.search.mockReturnValueOnce(
    Promise.resolve(bibliographyEntries),
  )
  render(
    <MemoryRouter initialEntries={[path]}>
      <BibliographySearch
        query={query}
        bibliographyService={bibliographyServiceMock}
      />
    </MemoryRouter>,
  )
  await waitForSpinnerToBeRemoved(screen)
}

test('Fetch results from bibliography service', async () => {
  await renderBibliographySearchComponent()
  expect(bibliographyServiceMock.search).toHaveBeenCalledWith(query)
})

test('Display search results correctly', async () => {
  await renderBibliographySearchComponent()
  bibliographyEntries.forEach((entry) => {
    const reference = createReferenceForEntry(entry)
    const citation = Citation.for(reference)

    expectCitationToBeDisplayed(citation)
    expectAuthorToBeDisplayed(entry)
  })
})

test('uses tools references routes when rendered in tools context', async () => {
  await renderBibliographySearchComponent('/tools/references')

  const firstEntry = bibliographyEntries[0]
  const citation = Citation.for(
    createReferenceForEntry(firstEntry),
  ).getMarkdown()
  const citationLink = screen.getByRole('link', { name: citation })

  expect(citationLink).toHaveAttribute(
    'href',
    `/tools/references/${encodeURIComponent(firstEntry.id)}`,
  )
})

function createReferenceForEntry(entry: BibliographyEntry): Reference {
  return new Reference('DISCUSSION', '', '', [], entry)
}

function expectCitationToBeDisplayed(citation: Citation): void {
  expect(screen.getByText(citation.getMarkdown())).toBeInTheDocument()
}

function expectAuthorToBeDisplayed(entry: BibliographyEntry): void {
  const authorRegExp = createAuthorRegExp(entry)
  const citation = Citation.for(createReferenceForEntry(entry))
  const bibliographyEntry = screen
    .getAllByRole('listitem')
    .find((item) => within(item).queryByText(citation.getMarkdown()) !== null)

  expect(bibliographyEntry).not.toBeNull()

  expect(
    within(bibliographyEntry as HTMLElement).getByText((content, element) => {
      return (
        (element?.classList.contains('csl-entry') &&
          authorRegExp.test(content)) ||
        false
      )
    }),
  ).toBeInTheDocument()
}
