import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

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

describe('long selected label', () => {
  function setup(): void {
    const cslData = cslDataFactory.build({
      title:
        'A very long catalogue reference title that should remain accessible while the select renders a constrained selected value',
    })
    entry = bibliographyEntryFactory.build({}, { transient: cslData })
    renderBibliographySelect()
  }

  it('keeps the full label available on the selected value', async () => {
    setup()
    const selectedLabel = await screen.findByTitle(entry.label)

    expect(selectedLabel).toHaveClass('search-form-select__single-value-label')
    expect(selectedLabel).toHaveTextContent(entry.label)
  })
})

describe('clearable selection', () => {
  it('reports an empty entry when the selection is cleared', async () => {
    entry = bibliographyEntryFactory.build()
    renderBibliographySelect(true)
    await screen.findByText(entry.label)
    onChange.mockClear()

    await userEvent.type(screen.getByLabelText('label'), '{backspace}')

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(new BibliographyEntry()),
    )
  })
})

describe('search options', () => {
  it('lists only identified entries in natural label order', async () => {
    const entries = [
      bibliographyEntryFactory.build({}, { transient: { id: 'RN10' } }),
      new BibliographyEntry(),
      bibliographyEntryFactory.build({}, { transient: { id: 'RN2' } }),
    ]
    const sortedLabels = [entries[0].label, entries[2].label].sort((a, b) =>
      new Intl.Collator([], { numeric: true }).compare(a, b),
    )
    render(
      <BibliographySelect
        isClearable={false}
        ariaLabel="label"
        searchBibliography={jest.fn().mockResolvedValue(entries)}
        value={new BibliographyEntry()}
        onChange={jest.fn()}
      />,
    )

    await userEvent.type(screen.getByLabelText('label'), 'a')
    const options = await screen.findAllByRole('option')

    expect(options.map((option) => option.textContent)).toEqual(sortedLabels)
  })
})

function renderBibliographySelect(isClearable = false): void {
  const searchBibliography = jest.fn().mockReturnValue(Promise.resolve([entry]))
  render(
    <>
      <BibliographySelect
        isClearable={isClearable}
        ariaLabel="label"
        searchBibliography={searchBibliography}
        value={entry}
        onChange={onChange}
      />
    </>,
  )
}
