import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import BibliographySelect from 'bibliography/ui/BibliographySelect'
import selectEvent from 'react-select-event'
import userEvent from '@testing-library/user-event'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { expectedLabel } from 'test-support/test-bibliographySelect'

let entry: BibliographyEntry
let searchEntry: BibliographyEntry
const onChange = jest.fn()

describe('no container short, no collection number', () => {
  beforeEach(async () => {
    entry = await factory.build('bibliographyEntry')
    searchEntry = await factory.build('bibliographyEntry')
    renderBibliographySelect()
  })

  it('Displays the entry label', () => {
    expect(screen.getByText(expectedLabel(entry))).toBeVisible()
  })

  it('Calls onChange when selecting an entry', async () => {
    await userEvent.type(
      screen.getByLabelText('label'),
      expectedLabel(searchEntry)
    )
    await selectEvent.select(
      screen.getByLabelText('label'),
      expectedLabel(searchEntry)
    )
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(searchEntry))
  })
})
describe('container short, no collection number', () => {
  let expectedLabelPrefix
  beforeEach(async () => {
    const cslData = await factory.build('cslDataWithContainerTitleShort')
    entry = await factory.build('bibliographyEntry', cslData)
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
  let expectedLabelPrefix
  beforeEach(async () => {
    const cslData = await factory.build('cslDataWithContainerTitleShort', {
      'collection-number': '8/1',
    })
    entry = await factory.build('bibliographyEntry', cslData)
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
  beforeEach(async () => {
    const cslData = await factory.build('cslData', {
      'collection-number': '8/1',
    })
    entry = await factory.build('bibliographyEntry', cslData)
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
