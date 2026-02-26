import React from 'react'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'
import _ from 'lodash'

import { changeValueByLabel, clickNth } from 'test-support/utils'
import ReferencesForm from './ReferencesForm'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  buildBorger1957,
  referenceFactory,
} from 'test-support/bibliography-fixtures'

const defaultReference = new Reference()

let expectedReference: Reference
let references: Reference[]
let searchEntry: BibliographyEntry
let searchBibliography
let onChange: (references: readonly Reference[]) => void

function setup() {
  references = referenceFactory.buildList(2)
  searchEntry = buildBorger1957()
  expectedReference = (_.head(references) as Reference).setDocument(searchEntry)
  searchBibliography = (): Promise<BibliographyEntry[]> =>
    Promise.resolve([searchEntry])
  onChange = jest.fn()
  render(
    <ReferencesForm
      value={references}
      onChange={onChange}
      searchBibliography={searchBibliography}
    />,
  )
}

test('Add reference', async () => {
  setup()
  clickNth(screen, 'Add Reference')

  expect(onChange).toHaveBeenCalledWith([...references, defaultReference])
})

test('Delete reference', async () => {
  setup()
  clickNth(screen, 'Delete Reference')

  expect(onChange).toHaveBeenCalledWith(_.tail(references))
})

test('Edit reference', async () => {
  setup()
  changeValueByLabel(screen, /ReferenceForm-Document-.*/, 'Borger')
  await screen.findByText(/Borger 1957/)
  clickNth(screen, /Borger 1957/, 0)

  expect(onChange).toHaveBeenCalledWith([
    expectedReference,
    ..._.tail(references),
  ])
})
