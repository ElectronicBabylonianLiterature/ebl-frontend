import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'

import BibliographySelect from 'bibliography/ui/BibliographySelect'
import selectEvent from 'react-select-event'
import userEvent from '@testing-library/user-event'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { expectedLabel } from 'test-support/test-bibliographySelect'
import {
  bibliographyEntryFactory,
  cslDataFactory,
  cslDataWithContainerTitleShortFactory,
} from 'test-support/bibliography-fixtures'

let entry: BibliographyEntry
let searchEntry: BibliographyEntry
const onChange = jest.fn()

describe('no container short, no collection number', () => {
  beforeEach(() => {
    entry = bibliographyEntryFactory.build()
    searchEntry = bibliographyEntryFactory.build()
    renderBibliographySelect()
  })

  it('Displays the entry label', () => {
    expect(screen.getByText(expectedLabel(entry))).toBeVisible()
  })

  it('Calls onChange when selecting an entry', async () => {
    userEvent.type(screen.getByLabelText('label'), expectedLabel(searchEntry))
    await selectEvent.select(
      screen.getByLabelText('label'),
      expectedLabel(searchEntry)
    )
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(searchEntry))
    jest.setTimeout(10000)
  })
})
describe('container short, no collection number', () => {
  let expectedLabelPrefix: string

  beforeEach(async () => {
    const cslData = cslDataWithContainerTitleShortFactory.build()
    entry = bibliographyEntryFactory.build({}, { transient: cslData })
    expectedLabelPrefix = `${entry.shortContainerTitle} = `
    renderBibliographySelect()
  })
  it('Displays the entry label', () => {
    expect(
      screen.getByText(`${expectedLabelPrefix}${expectedLabel(entry)}`)
    ).toBeVisible()
  })
})

describe('container short, collection number', () => {
  let expectedLabelPrefix: string

  beforeEach(() => {
    const cslData = cslDataWithContainerTitleShortFactory.build({
      'collection-number': '8/1',
    })
    entry = bibliographyEntryFactory.build({}, { transient: cslData })
    expectedLabelPrefix = `${entry.shortContainerTitle} ${entry.collectionNumber} = `
    renderBibliographySelect()
  })

  it('Displays the entry label', () => {
    expect(
      screen.getByText(`${expectedLabelPrefix}${expectedLabel(entry)}`)
    ).toBeVisible()
  })
})
describe('no container short, collection number', () => {
  beforeEach(() => {
    const cslData = cslDataFactory.build({
      'collection-number': '8/1',
    })
    entry = bibliographyEntryFactory.build({}, { transient: cslData })
    renderBibliographySelect()
  })
  it('Displays the entry label', () => {
    expect(screen.getByText(expectedLabel(entry))).toBeVisible()
  })
})

function renderBibliographySelect(): void {
  const searchBibliography = jest
    .fn()
    .mockReturnValue(Promise.resolve([searchEntry]))
  render(
    <>
      <BibliographySelect
        isClearable={false}
        ariaLabel="label"
        searchBibliography={searchBibliography}
        value={entry}
        onChange={onChange}
      />
    </>
  )
}
