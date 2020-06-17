import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'

import {
  whenChangedByLabel,
  changeValueByLabel,
  clickNth,
} from 'test-support/utils'
import ReferenceForm from './ReferenceForm'
import { buildBorger1957 } from 'test-support/bibliography-fixtures'

let reference
let element
let onChange
let searchBibliography
let entry

beforeEach(async () => {
  reference = await factory.build('reference')
  entry = await buildBorger1957()
  onChange = jest.fn()
  searchBibliography = jest.fn()
  searchBibliography.mockReturnValue(Promise.resolve([entry]))
  element = render(
    <ReferenceForm
      value={reference}
      onChange={onChange}
      searchBibliography={searchBibliography}
    />
  )
})

test(`Changing document calls onChange with updated value`, async () => {
  changeValueByLabel(element, 'Document', 'Borger')
  await element.findByText(/Borger 1957/)
  await clickNth(element, /Borger 1957/, 0)

  expect(onChange).toHaveBeenCalledWith(reference.setDocument(entry))
})

describe.each([
  ['Pages', 'pages', 'setPages', '3'],
  ['Pages', 'pages', 'setPages', ''],
  ['Type', 'type', 'setType', 'EDITION'],
  ['Notes', 'notes', 'setNotes', 'new notes'],
  ['Notes', 'notes', 'setNotes', ''],
])('%s', (label, property, setter, newValue) => {
  it(`Has correct label and value`, () => {
    expect(element.getByLabelText(label).value).toEqual(reference[property])
  })

  it(`Calls onChange with updated value`, () => {
    whenChangedByLabel(element, label, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith((updatedItem) => reference[setter](updatedItem))
  })
})

it('Displays Lines Cited', () => {
  expect(element.getByLabelText('Lines Cited').value).toEqual(
    reference.linesCited.join(',')
  )
})

test.each([
  ['3.1,2', ['3.1', '2']],
  ['', []],
])('Calls onChange with updated Lines Cited %s', (newValue, expectedValue) => {
  whenChangedByLabel(element, 'Lines Cited', newValue)
    .expect(onChange)
    .toHaveBeenCalledWith((updatedItem) =>
      reference.setLinesCited(expectedValue)
    )
})
