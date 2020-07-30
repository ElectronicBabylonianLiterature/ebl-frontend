import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import BibliographySelect from './BibliographySelect'
import {
  expectedLabel,
  fillBibliographySelect,
} from 'test-support/test-bibliographySelect'

let entry
let searchEntry
let onChange
let element
let searchBibliography

beforeEach(async () => {
  entry = await factory.build('bibliographyEntry')
  searchEntry = await factory.build('bibliographyEntry')
  onChange = jest.fn()
  searchBibliography = jest.fn()
  searchBibliography.mockReturnValue(Promise.resolve([searchEntry]))
  element = render(
    <>
      <label id="label">Entry</label>
      <BibliographySelect
        aria-labelledby="label"
        searchBibliography={searchBibliography}
        value={entry}
        onChange={onChange}
      />
    </>
  )
})

it('Displays the entry label', () => {
  expect(element.container).toHaveTextContent(expectedLabel(entry))
})

it('Calls onChange when selecting an entry', async () => {
  await fillBibliographySelect(searchEntry, 'Entry', element, 'Borger')
  await waitFor(() => expect(onChange).toHaveBeenCalledWith(searchEntry))
})
