import React from 'react'
import { render, RenderResult } from '@testing-library/react'

import {
  whenChangedByLabel,
  changeValueByLabel,
  clickNth,
} from 'test-support/utils'
import ReferenceForm from './ReferenceForm'
import {
  buildBorger1957,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import Reference from 'bibliography/domain/Reference'

let reference: Reference
let element: RenderResult
let onChange
let searchBibliography
let entry

beforeEach(() => {
  reference = referenceFactory.build()
  entry = buildBorger1957()
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
  changeValueByLabel(element, /ReferenceForm-Document-.*/, 'Borger')
  await element.findByText(/Borger 1957/)
  clickNth(element, /Borger 1957/, 0)

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
    expect((element.getByLabelText(label) as HTMLInputElement).value).toEqual(
      reference[property]
    )
  })

  it(`Calls onChange with updated value`, () => {
    whenChangedByLabel(element, label, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith((updatedItem) => reference[setter](updatedItem))
  })
})

it('Displays Lines Cited', () => {
  expect(
    (element.getByLabelText('Lines Cited') as HTMLInputElement).value
  ).toEqual(reference.linesCited.join(','))
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
