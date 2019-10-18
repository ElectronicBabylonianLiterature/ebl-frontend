import React from 'react'
import { render, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'
import _ from 'lodash'

import { changeValueByLabel, clickNth } from 'test-helpers/utils'
import ReferencesForm from './ReferencesForm'
import Reference from 'bibliography/domain/Reference'

const defaultReference = new Reference()

let expectedReference
let references
let element
let searchEntry
let searchBibliography
let onChange

beforeEach(async () => {
  references = await factory.buildMany('reference', 2)
  searchEntry = await factory.build('bibliographyEntry', {
    author: [{ family: 'Borger' }],
    issued: { 'date-parts': [[1957]] }
  })
  expectedReference = _.head(references).setDocument(searchEntry)
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
  clickNth(element, 'Add Reference')

  expect(onChange).toHaveBeenCalledWith([...references, defaultReference])
})

test('Delete reference', async () => {
  await clickNth(element, 'Delete Reference')

  expect(onChange).toHaveBeenCalledWith(_.tail(references))
})

test('Edit reference', async () => {
  changeValueByLabel(element, 'Document', 'Borger')
  await waitForElement(() => element.getByText(/Borger 1957/))
  clickNth(element, /Borger 1957/, 0)

  expect(onChange).toHaveBeenCalledWith([
    expectedReference,
    ..._.tail(references)
  ])
})
