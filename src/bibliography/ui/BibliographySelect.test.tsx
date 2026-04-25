import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'

import BibliographySelect from 'bibliography/ui/BibliographySelect'
import userEvent from '@testing-library/user-event'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

import {
  bibliographyEntryFactory,
  cslDataFactory,
  cslDataWithContainerTitleShortFactory,
} from 'test-support/bibliography-fixtures'

let entry: BibliographyEntry
const onChange = jest.fn()

jest.setTimeout(20000)

describe('no container short, no collection number', () => {
  function setup(): void {
    entry = bibliographyEntryFactory.build()
    renderBibliographySelect()
  }

  it('Displays the entry label', async () => {
    setup()
    expect(await screen.findByText(entry.label)).toBeVisible()
  })

  it('Calls onChange when selecting an entry', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('label'), entry.label)
    await userEvent.click(
      await screen.findByText(
        (text, element) =>
          text === entry.label &&
          (element?.getAttribute('class') ?? '').includes('option'),
      ),
    )
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(entry))
  })
})

describe('container short, no collection number', () => {
  function setup(): void {
    const cslData = cslDataWithContainerTitleShortFactory.build()
    entry = bibliographyEntryFactory.build({}, { transient: cslData })
    renderBibliographySelect()
  }
  it('Displays the entry label', async () => {
    setup()
    expect(await screen.findByText(entry.label)).toBeVisible()
  })
})

describe('container short, collection number', () => {
  function setup(): void {
    const cslData = cslDataWithContainerTitleShortFactory.build({
      'collection-number': '8/1',
    })
    entry = bibliographyEntryFactory.build({}, { transient: cslData })
    renderBibliographySelect()
  }

  it('Displays the entry label', async () => {
    setup()
    expect(await screen.findByText(entry.label)).toBeVisible()
  })
})
describe('no container short, collection number', () => {
  function setup(): void {
    const cslData = cslDataFactory.build({
      'collection-number': '8/1',
    })
    entry = bibliographyEntryFactory.build({}, { transient: cslData })
    renderBibliographySelect()
  }
  it('Displays the entry label', async () => {
    setup()
    expect(await screen.findByText(entry.label)).toBeVisible()
  })
})

function renderBibliographySelect(): void {
  const searchBibliography = jest.fn().mockReturnValue(Promise.resolve([entry]))
  render(
    <>
      <BibliographySelect
        isClearable={false}
        ariaLabel="label"
        searchBibliography={searchBibliography}
        value={entry}
        onChange={onChange}
      />
    </>,
  )
}
