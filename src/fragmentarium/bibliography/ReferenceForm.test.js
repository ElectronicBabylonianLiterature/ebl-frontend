import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'

import { whenChangedByLabel, changeValueByLabel, clickNth } from 'testHelpers'
import ReferenceForm from './ReferenceForm'

let reference
let element
let onChange
let searchBibliography
let entry

beforeEach(async () => {
  reference = await factory.build('reference')
  entry = await factory.build('bibliographyEntry', { author: [{ family: 'Borger' }], issued: { 'date-parts': [[1957]] } })
  onChange = jest.fn()
  searchBibliography = jest.fn()
  searchBibliography.mockReturnValue(Promise.resolve([entry]))
  element = render(<ReferenceForm value={reference} onChange={onChange} searchBibliography={searchBibliography} />)
})

it(`Changing document calls onChange with updated value`, async () => {
  changeValueByLabel(element, 'Document', 'Borger')
  await waitForElement(() => element.getByText(/Borger 1957/))
  clickNth(element, /Borger 1957/, 0)

  expect(onChange).toHaveBeenCalledWith({ ...reference, id: entry.id, document: entry })
})

describe.each([
  ['Pages', 'pages', '3'],
  ['Type', 'type', 'EDITION'],
  ['Notes', 'notes', 'new notes']
])('%s', (label, property, newValue) => {
  it(`Has correct label and value`, () => {
    expect(element.getByLabelText(label).value).toEqual(reference[property])
  })

  it(`Calls onChange with updated value`, async () => {
    whenChangedByLabel(element, label, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith(updatedItem => ({ ...reference, [property]: updatedItem }))
  })
})

it('Displays Lines Cited', () => {
  expect(element.getByLabelText('Lines Cited').value).toEqual(reference.linesCited.join(','))
})

it(`Calls onChange with updated Lines Cited`, async () => {
  whenChangedByLabel(element, 'Lines Cited', '3.1,2')
    .expect(onChange)
    .toHaveBeenCalledWith(updatedItem => ({ ...reference, linesCited: updatedItem.split(',') }))
})
