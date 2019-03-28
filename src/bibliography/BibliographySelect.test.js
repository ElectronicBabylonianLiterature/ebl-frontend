import React from 'react'
import { render, waitForElement, wait } from 'react-testing-library'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'

import BibliographySelect from './BibliographySelect'
import { changeValueByLabel, clickNth } from 'test-helpers/utils'

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
  element = render(<>
    <label id='label'>Entry</label>
    <BibliographySelect
      aria-labelledby='label'
      searchBibliography={searchBibliography}
      value={entry}
      onChange={onChange} />
  </>)
})

it('Displays the entry label', () => {
  expect(element.container).toHaveTextContent(expectedLabel(entry))
})

it('Calls onChange when selecting an entry', async () => {
  await fill()
  await wait(() => expect(onChange).toHaveBeenCalledWith(searchEntry))
})

async function fill () {
  const label = expectedLabel(searchEntry)
  changeValueByLabel(element, 'Entry', 'Borger')
  await waitForElement(() => element.getByText(label))
  clickNth(element, label, 0)
}

function expectedLabel (entry) {
  return `${entry.author} ${entry.year} ${entry.title}`
}
