import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'
import _ from 'lodash'

import { changeValueByLabel, clickNth } from 'test-helpers/utils'
import ReferencesForm from './ReferencesForm'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { buildBorger1957 } from 'test-helpers/bibliography-fixtures'

const defaultReference = new Reference()

let expectedReference: Reference
let references: Reference[]
let element: RenderResult
let searchEntry: BibliographyEntry
let searchBibliography
let onChange

beforeEach(async () => {
  references = await factory.buildMany('reference', 2)
  searchEntry = await buildBorger1957()
  expectedReference = (_.head(references) as Reference).setDocument(searchEntry)
  searchBibliography = (): Promise<BibliographyEntry[]> =>
    Promise.resolve([searchEntry])
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
  clickNth(element, 'Delete Reference')

  expect(onChange).toHaveBeenCalledWith(_.tail(references))
})

test('Edit reference', async () => {
  changeValueByLabel(element, 'Document', 'Borger')
  await element.findByText(/Borger 1957/)
  clickNth(element, /Borger 1957/, 0)

  expect(onChange).toHaveBeenCalledWith([
    expectedReference,
    ..._.tail(references),
  ])
})
