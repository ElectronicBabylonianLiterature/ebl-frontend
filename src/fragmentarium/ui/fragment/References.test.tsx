import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'
import _ from 'lodash'

import { changeValueByLabel, clickNth, submitForm } from 'test-support/utils'
import References from './References'
import Reference from 'bibliography/domain/Reference'
import { buildBorger1957 } from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

const defaultReference = new Reference()

let expectedReference: Reference
let references: Reference[]
let element: RenderResult
let searchEntry: BibliographyEntry
let searchBibliography
let updateReferences

beforeEach(async () => {
  searchEntry = await buildBorger1957()
  expectedReference = new Reference(
    'COPY',
    '1-2',
    'notes',
    ['1', '2'],
    searchEntry
  )
  searchBibliography = (): Promise<BibliographyEntry[]> =>
    Promise.resolve([searchEntry])
  updateReferences = jest.fn()
})

describe('Edit references', () => {
  beforeEach(async () => {
    references = await factory.buildMany('reference', 2)
    await renderReferencesAndWait()
  })

  test('Add reference', async () => {
    clickNth(element, 'Add Reference')
    await submitForm(element)

    expect(updateReferences).toHaveBeenCalledWith([
      ...references,
      defaultReference,
    ])
  })

  test('Delete reference', async () => {
    clickNth(element, 'Delete Reference')
    await submitForm(element)

    expect(updateReferences).toHaveBeenCalledWith(_.tail(references))
  })

  test('Edit reference', async () => {
    await inputReference()
    await submitForm(element)

    expect(updateReferences).toHaveBeenCalledWith([
      expectedReference,
      ..._.tail(references),
    ])
  })
})

it('Creates a default reference if none present', async () => {
  updateReferences.mockImplementationOnce(() => Promise.resolve())
  references = []
  await renderReferencesAndWait()
  await submitForm(element)

  expect(updateReferences).toHaveBeenCalledWith([defaultReference])
})

function renderReferences(): void {
  element = render(
    <References
      references={references}
      searchBibliography={searchBibliography}
      updateReferences={updateReferences}
    />
  )
}

async function renderReferencesAndWait(): Promise<void> {
  renderReferences()
  await element.findAllByText('Document')
}

async function inputReference(): Promise<void> {
  changeValueByLabel(element, /ReferenceForm-Document-.*/, 'Borger')
  await element.findByText(/Borger 1957/)
  clickNth(element, /Borger 1957/, 0)
  changeValueByLabel(element, 'Type', 'COPY')
  changeValueByLabel(element, 'Pages', '1-2')
  changeValueByLabel(element, 'Notes', 'notes')
  changeValueByLabel(element, 'Lines Cited', '1,2')
}
