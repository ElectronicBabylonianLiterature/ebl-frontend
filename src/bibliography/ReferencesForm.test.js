import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import { List } from 'immutable'
import { Promise } from 'bluebird'

import { changeValueByLabel, clickNth } from 'test-helpers/utils'
import ReferencesForm from './ReferencesForm'
import Reference from 'bibliography/Reference'

const defaultReference = new Reference()

let expectedReference
let references
let element
let searchEntry
let searchBibliography
let onChange

beforeEach(async () => {
  references = List(await factory.buildMany('reference', 2))
  searchEntry = await factory.build('bibliographyEntry', {
    author: [{ family: 'Borger' }],
    issued: { 'date-parts': [[1957]] }
  })
  expectedReference = references.get(0).setDocument(searchEntry)
  searchBibliography = () => Promise.resolve([searchEntry])
  onChange = jest.fn()
  element = render(
    <ReferencesForm
      value={references}
      onChange={onChange}
      searchBibliography={searchBibliography}
    />
  )
})

test('Add reference', async () => {
  await clickNth(element, 'Add Reference')

  expect(onChange).toHaveBeenCalledWith(references.push(defaultReference))
})

test('Delete reference', async () => {
  await clickNth(element, 'Delete Reference')

  expect(onChange).toHaveBeenCalledWith(references.skip(1))
})

test('Edit reference', async () => {
  changeValueByLabel(element, 'Document', 'Borger')
  await waitForElement(() => element.getByText(/Borger 1957/))
  clickNth(element, /Borger 1957/, 0)

  expect(onChange).toHaveBeenCalledWith(references.set(0, expectedReference))
})
